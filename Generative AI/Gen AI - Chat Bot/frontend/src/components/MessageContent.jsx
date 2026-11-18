import { Fragment } from 'react'

function inlineContent(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g)

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={key}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code className="inline-code" key={key}>{part.slice(1, -1)}</code>
    if (part.startsWith('*') && part.endsWith('*')) return <em key={key}>{part.slice(1, -1)}</em>
    return <Fragment key={key}>{part}</Fragment>
  })
}

function isBlockStart(line) {
  return /^\s*(```|#{1,6}\s|>\s?|[-*+]\s|\d+[.)]\s)/.test(line)
}

export default function MessageContent({ content }) {
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) {
      index += 1
      continue
    }

    const fence = line.match(/^\s*```\s*([\w-]*)/)
    if (fence) {
      const codeLines = []
      index += 1
      while (index < lines.length && !/^\s*```/.test(lines[index])) {
        codeLines.push(lines[index])
        index += 1
      }
      if (index < lines.length) index += 1
      blocks.push(
        <pre className="code-block" key={`code-${blocks.length}`}>
          {fence[1] && <span className="code-language">{fence[1]}</span>}
          <code>{codeLines.join('\n')}</code>
        </pre>,
      )
      continue
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      const Heading = `h${heading[1].length}`
      blocks.push(<Heading key={`heading-${blocks.length}`}>{inlineContent(heading[2], `heading-${blocks.length}`)}</Heading>)
      index += 1
      continue
    }

    if (/^>\s?/.test(line)) {
      const quote = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push(<blockquote key={`quote-${blocks.length}`}>{quote.map((part, partIndex) => <p key={partIndex}>{inlineContent(part, `quote-${partIndex}`)}</p>)}</blockquote>)
      continue
    }

    const listMatch = line.match(/^\s*([-*+]|\d+[.)])\s+(.+)$/)
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1])
      const List = ordered ? 'ol' : 'ul'
      const items = []
      while (index < lines.length) {
        const item = lines[index].match(/^\s*([-*+]|\d+[.)])\s+(.+)$/)
        if (!item || /^\d/.test(item[1]) !== ordered) break
        items.push(item[2])
        index += 1
      }
      blocks.push(<List key={`list-${blocks.length}`}>{items.map((item, itemIndex) => <li key={itemIndex}>{inlineContent(item, `list-${itemIndex}`)}</li>)}</List>)
      continue
    }

    const paragraph = [line]
    index += 1
    while (index < lines.length && lines[index].trim() && !isBlockStart(lines[index])) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push(<p key={`paragraph-${blocks.length}`}>{inlineContent(paragraph.join(' '), `paragraph-${blocks.length}`)}</p>)
  }

  return <div className="formatted-content">{blocks}</div>
}
