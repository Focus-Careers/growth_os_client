const TEAM_MEMBERS = [
  { name: 'Lead Gen Expert', initial: 'L' },
  { name: 'Campaign Manager', initial: 'C' },
  { name: 'Administrator', initial: 'A' },
]

export default function EntryHeader() {
  return (
    <div className="entry-header">
      <div className="entry-headline">
        Introducing your AI marketing department.
        <br />
        <span className="entry-headline-italic">42 employees</span>
        <span className="entry-headline-muted">, ready to work.</span>
      </div>

      <div className="entry-team-prose">
        <span>Led by </span>
        <span className="badge-pill badge-pill-watson">
          <span className="badge-initial badge-initial-watson">W</span>
          <span className="badge-name badge-name-watson">Watson</span>
          <span className="badge-role">CMO</span>
        </span>
        <span> — with specialists including</span>
        {TEAM_MEMBERS.map((member, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 && <span> and</span>}
            <span className="badge-pill">
              <span className="badge-initial">{member.initial}</span>
              <span className="badge-name">{member.name}</span>
            </span>
            {i < arr.length - 2 && <span>,</span>}
          </span>
        ))}
        <span>
          {' '}
          — a full department that{' '}
          <span className="entry-team-prose-italic">works as your marketing team, or alongside your existing one</span>.
        </span>
      </div>
    </div>
  )
}
