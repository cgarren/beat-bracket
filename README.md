# Beat Bracket
## TODO
### High
- **MAYBE: undo a song selction when you click on it again**
- **Add social features like following user profiles and sharing entire profiles instead of just brackets**
- **fix the unsaved changes prompt (mostly fixed except if user loads existing bracket andd makes change immediately)**
- **add new bracket/my brckets links to navbar and just have sign out under profile**
- **Social Feature: Let people vote on tracks to make a communal bracket when they aren't at the same computer (bracket permissions required). Also maybe have like 24 hours for the first rounds, another day for the second round etc... Basically let people make a bracket together. If this is implemented correctly, it should basically let all of sigep vote on songs and make a bracket together. You could even do global brackets with millions of votes**
- **Add stats like “10 people also ranked xxx song first" or percentage of people maybe. Show artist stats when the user finishes a bracket**
- **Let people reseed brackets by drag and drop (edit mode which includes deleting songs and reseeding)**
- Make save button turn red/show error when that occurs. Cosider making it turn/flash green too insead of showing the alert
- Add start over button with prompt (just clears the bracket, doesn't get songs or anything)
- Let people fill out a bracket that someone else made (clone bracket button). Attribute the new bracket tot he original person (maybe have a bracketCreator field spearate from the bracket owner? and/or make these kinds of brackets uneditable with the options)
- Make a toggle for songs exclusively by the artist vs songs the artist is featured on (regex/matching probably)
- Make a toggle that decides which songs to include in the bracket in the first place (random vs popularity vs custom - currently just the most popular)
### Medium
- SEO for each artist (ex. if someone searches for "Kanye West bracket every song" they should see the Kanye West bracket)
- Allow user to delete certain songs
- Display seed number/popularity in badge on each song button with toggle to hide it (maybe a badge for album/single/feature and toggles for each)
- Add metrics on generation like - number of songs, seconds it took to make, number from albums vs singles, etc...
- Play from the beginning of songs (scrubber too maybe?)
- USE REFS INSTEAD OF REDRAWING EVERY TIME ONE THING CHANGES
- Make the bracket options more attractive/streamlined
- Use update function instead of put on the backend to eliminate unnecessary writes
- Put backend code on github (maybe consider making it private)
- Better duplicate detection
### Low
- Write function to purge sessions that are expired every hour
- Animation with one song knocking out or killing another song
- Option to include/exclude remixes (would have to be word detection or regex based, beta first)
- Make the bracket from a spotify playlist
- Full Mobile support (including songButton stretching toggle)
- Fix byes (make it possible to work with odd numbers of songs)
- Use spotify metrics to filter (only kanye's slow songs, danceable songs, etc...)
- Make created playlist description fit on mobile
- Generate picture with just final four/eight for easy sharing. Maybe some pretty sharable grpahics that just show the winner and artist
- Once a column is finished zoom/scale the bracket to make it easier to do the next column
- Toggle to enable/disable songButton stretching to show the full song name