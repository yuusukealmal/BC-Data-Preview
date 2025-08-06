export const langs = ["json", "txt", "xml", "csv", "ts"];
export const getFileLang = (filename: string): string => {
  const extension = filename.split(".").pop();

  const langMap: Record<string, string> = {
    json: "json",
    preset: "json",
    txt: "text",
    xml: "xml",
    csv: "csv",
  };
  return langMap[extension || ""] || "text";
};
