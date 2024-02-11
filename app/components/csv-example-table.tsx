export function ExampleTable({
  columns,
  examples,
}: {
  columns: string[];
  examples: string[][];
}) {
  return (
    <div className="relative max-h-[280px] w-full scroll-pt-[2.321rem] overflow-auto rounded-lg bg-white text-gray-600 shadow">
      <table
        aria-label="Example"
        className="w-full border-separate border-spacing-0"
      >
        <thead>
          {columns.map((column, index) => (
            <th
              key={index}
              className="sticky top-0 cursor-default whitespace-nowrap border-0 border-b border-solid border-slate-300 bg-slate-200 p-0 p-2 text-left font-bold outline-none first:rounded-tl-lg last:rounded-tr-lg"
            >
              {column}
            </th>
          ))}
        </thead>
        <tbody>
          {examples.map((example, index) => (
            <tr
              key={index}
              className="group cursor-default outline-none even:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-600 selected:bg-slate-600 selected:text-white selected:focus-visible:outline-white"
            >
              {example.map((column, index) => (
                <td
                  key={index}
                  className={`truncate px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-600 group-selected:focus-visible:outline-white`}
                >
                  <span>{column}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
