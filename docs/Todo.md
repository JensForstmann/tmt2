# TODO

- remove class default values (makes it easier if constructing from normal or from serialize)
- streamline new xy() process (normal vs serialized)
- pause in last round: don't accept round/match end
- auth
    - auth per match?
- get match by remoteId
- include score in IMatchEndWebhook
- webhook after all maps are set (after map election)
- on init:
    - timeout on rcon connect
    - on error httpCode > 500
    - on error: do not save match
