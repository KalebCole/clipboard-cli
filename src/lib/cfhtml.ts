/**
 * CF_HTML (Clipboard Format HTML) header generation.
 * Windows clipboard rich-text format used by Teams, Loop, Outlook, etc.
 */

/** Wrap HTML content in a CF_HTML envelope with proper byte offsets. */
export function buildCfHtml(htmlFragment: string): string {
  const startFragment = '<!--StartFragment-->';
  const endFragment = '<!--EndFragment-->';

  const fullHtml = `<html>\r\n<body>\r\n${startFragment}\r\n${htmlFragment}\r\n${endFragment}\r\n</body>\r\n</html>`;

  // Placeholder header — we'll replace the offsets after calculating byte lengths
  const headerTemplate =
    'Version:0.9\r\n' +
    'StartHTML:SSSSSSSSSS\r\n' +
    'EndHTML:EEEEEEEEEE\r\n' +
    'StartFragment:FFFFFFFFFF\r\n' +
    'EndFragment:GGGGGGGGGG\r\n';

  const enc = new TextEncoder();
  const headerBytes = enc.encode(headerTemplate).length;

  const startHtml = headerBytes;
  const endHtml = headerBytes + enc.encode(fullHtml).length;

  // Calculate fragment offsets by directly measuring byte lengths of known prefixes
  const beforeStartFragment = `<html>\r\n<body>\r\n${startFragment}\r\n`;
  const startFragmentOffset = headerBytes + enc.encode(beforeStartFragment).length;

  const throughEndFragment = `<html>\r\n<body>\r\n${startFragment}\r\n${htmlFragment}\r\n${endFragment}`;
  const endFragmentOffset = headerBytes + enc.encode(throughEndFragment).length;

  // Build header with actual offsets (zero-padded to 10 digits)
  const pad = (n: number) => String(n).padStart(10, '0');
  const header =
    'Version:0.9\r\n' +
    `StartHTML:${pad(startHtml)}\r\n` +
    `EndHTML:${pad(endHtml)}\r\n` +
    `StartFragment:${pad(startFragmentOffset)}\r\n` +
    `EndFragment:${pad(endFragmentOffset)}\r\n`;

  return header + fullHtml;
}
