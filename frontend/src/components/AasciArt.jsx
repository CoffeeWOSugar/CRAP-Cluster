export default function AsciiArt() {
  return (
    <pre style={{ 
        textAlign: "center",
        boxShadow: "none",
        fontFamily: "monospace",
        fontSize: "20px",
        margin: 0,
        padding: 0,
        background: "transparent",
        border: "none",
        paddingBottom: "7.5%"
    }}>
{String.raw` ██████╗██████╗  █████╗ ██████╗ ██╗
██╔════╝██╔══██╗██╔══██╗██╔══██╗██║
██║     ██████╔╝███████║██████╔╝██║
██║     ██╔══██╗██╔══██║██╔═══╝ ╚═╝
╚██████╗██║  ██║██║  ██║██║     ██╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝`}
    </pre>
  );
}