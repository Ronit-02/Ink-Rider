import { fonts, fontSizes } from '@/styles/tokens'

const BODY_PARAGRAPHS = [
  'There is a particular kind of dislocation that happens when you return to a place you thought you knew. The streets look the same, the buildings haven\'t moved, and yet everything feels slightly off — like a photograph developed with the wrong chemicals.',
  'I grew up in a small coastal town that I left at eighteen, convinced I had extracted everything it had to offer. Mountains hemming the sea, a harbour that smelled of diesel and salt, a single bookshop run by a man who read every title he stocked.',
  'When I returned last spring — for reasons I won\'t go into here — I found myself looking at it through a completely different aperture. The mountains were still there, obviously. But now I noticed how they create a specific quality of afternoon light that I have never encountered anywhere else in the world.',
  'Familiarity, I am coming to believe, is not a destination. It is a habit of not looking. The antidote is not novelty. It is attention.',
  'The philosopher Simone Weil wrote that attention is the rarest and purest form of generosity. She was writing about human relationships, but I think she was also describing something essential about the relationship between a person and a place.',
  'To truly look at something familiar — really look — is to discover that you never fully saw it in the first place. The town I grew up in is not the town I thought I grew up in. It is stranger, more specific, more itself.',
]

export default function PostBody() {
  return (
    <div>
      {BODY_PARAGRAPHS.map((para, i) => (
        <p
          key={i}
          style={{
            fontFamily: fonts.sans,
            fontSize: 15,
            lineHeight: 1.82,
            marginBottom: 20,
          }}
        >
          {para}
        </p>
      ))}
    </div>
  )
}
