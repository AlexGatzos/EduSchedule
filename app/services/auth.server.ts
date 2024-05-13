// app/services/auth.server.ts
import { Authenticator } from "remix-auth";
import type { OAuth2Profile} from "remix-auth-oauth2";
import { OAuth2Strategy } from "remix-auth-oauth2";
import { sessionStorage } from "~/services/session.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export interface Profile {
  uid: string
  am: string
  regyear: string
  regsem: string
  "givenName;lang-el": string
  "sn;lang-el": string
  "fathersname;lang-el": string
  eduPersonAffiliation: string
  eduPersonPrimaryAffiliation: string
  title: string
  "title;lang-el": string
  "cn;lang-el": string
  cn: string
  sn: string
  givenName: string
  fathersname: string
  secondarymail: string
  telephoneNumber: string
  labeledURI: string
  id: string
  mail: string
  sem: string
  pwdChangedTime: string
  socialMedia: SocialMedia
  profilePhoto: string
  isAdmin: boolean
}

export interface SocialMedia {
  socialMediaExtra: any[]
}

export let authenticator = new Authenticator<{profile:Profile,accessToken: string;
  refreshToken?: string;
  extraParams: {
    user: string;
  };}>(sessionStorage);

class IHUOAuth2Strategy extends OAuth2Strategy<{}, OAuth2Profile, {}> {
  protected async fetchAccessToken(code: string, params: URLSearchParams): Promise<{
    accessToken: string;
    refreshToken?: string;
    extraParams: {
      user: string;
    };
}> {
  let tokenResponse = await fetch(this.tokenURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: this.clientID,
      client_secret: this.clientSecret,
      grant_type: 'authorization_code',
    })
  })

  let result = await tokenResponse.json() as {
      "access_token": string,
      "user": string
  }

  return {
    accessToken: result.access_token,
    extraParams: {
      user: result.user
    }
  }
}
}


authenticator.use(
    new IHUOAuth2Strategy(
      {
        authorizationURL: "https://login.iee.ihu.gr/authorization",
        tokenURL: "https://login.iee.ihu.gr/token",
        clientID: "65c7cd26baf556040abcc0c2",
        clientSecret: "3wkt487iy7oux2370ejlgqx7n3iwuz1lfmnh7bko9o8n9ievd5",
        callbackURL: "http://localhost:3000/auth/callback",
        scope: "profile",
        responseType: "code",
        useBasicAuthenticationHeader: true
      },
      async ({
        accessToken,
        refreshToken,
        extraParams,
        context,
        request,
      }) => {
        console.log({accessToken, refreshToken, extraParams,  context, request})
        // here you can use the params above to get the user and return it
        // what you do inside this and how you find the user is up to you
        let options = {
          method: 'GET',
          headers: {'x-access-token': accessToken, 'Content-Type': 'application/json'},
        };
        let profile = await fetch('http://api.it.teithe.gr/profile', options)
          .then(response => response.json()) as Profile

        profile.isAdmin = Boolean(profile.uid === process.env.ADMIN_UID)

        return {
            accessToken,
            refreshToken,
            extraParams,
            profile,
            context,
            request
        };
      }
    ),
    // this is optional, but if you setup more than one OAuth2 instance you will
    // need to set a custom name to each one
    "ihu"
  );