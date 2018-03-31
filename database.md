# Database Layout

General limitations:
 * IDs cannot be renamed. That makes names a bad option for an ID, but they can still be indexed as a secondary field for performance.
 * Databases cannot be renamed. To support multiple libraries, mappings to/from displayable names will be kept in the settings DB.
 * IndexedDB databases when used through PouchDB are closer in function to a single traditional database table.
 * In order to best fit our data we should split object types into different databases.

Layout:
 * Settings DB - general application settings and settings related to specific libraries
 * Library Servers DBs - separate DB for each library, containing only servers
 * Library Creature DBs - separate DB for each library, containing only creatures

## Settings
 * Contains application settings and settings for each library.
 * Application settings should be stored in a single entry with the index `settings`.
 * Library settings should be stored in entries named after the library ID.

Contents of the application `settings` entry:
| Key | Type (jsdoc) | Description |
|-:|:-:|-|
| libraries | `{[name:string]:string}` | Library display name -> database name mapping |

Contents of library settings entries:
| Key | Type (jsdoc) | Default (if unset) | Description |
|-:|:-:|-|-|
| showDead | `boolean` | `true` | Whether to show creatures with status Dead |
| showUnavilable | `boolean` | `true` | Whether to show creatures with status Unavilable |
| librarySort | `string` | `"name"` | Column name to sort the lirary on |

## Libraries
 * Support multiple libraries, each containing server definitions and creatures.
 * It is not possible to rename databases after creation so each DB will need a unique, unchanging name.
 * Database IDs will be mapped from display names by maintaining the `libraries` dictionary in Settings.
 * For performance, each object type stored in the library should be held in a different database, with a name to include the library's ID.

Libraries contain:
 * Server definitions
 * Creature definitions

### Server Defintions
Servers should be stored in a database named `servers_` followed by the library ID.
Primary keys are references by creatures that may move around, so UUIDs are the most sensible choice.

Fields:
| Key | Type (jsdoc) | Default (if unset) | Description |
|-:|:-:|-|-|
| name | `string` | - | User's name for the server |
| singlePlayer | `boolean` | `false` | Apply single player extra multipliers? |
| multipliers | `number[][]` | - | 8x4 array with multipliers, or null if not overridden from official |
| IBM | `boolean` | `1` | Imprint multiplier |
| wildLevelStep | `number?` | `1` | The size of the step between wild creature levels, or undefined |


### Creature Defintions
Creatures should be stored in a database named `creatures_` followed by the library ID.
Primary keys for creatures are simply the creature's UUID, which is either imported or created at random.

If creatures reference pre-defined servers they may do so without including them in the servers list in the library.

Fields:
| Key | Type (jsdoc) | Default (if unset) | Description |
|-:|:-:|-|-|
| server_uuid | `string` | - | The server the creature belongs to |
| species | `string` | - | Species name |
| name | `string` | - | Creature name |
| female | `boolean` | - | Set if the creature is female |
| neutered | `boolean` | false | Set if creature is neutered |
| status | `string` | `"Available"` | Dead \| Available \| Unavailable |
| levels | `number[][]` | - | Array of `[Lw,Ld]` pairs, one for each stat |
| tamingEff | `number` | - | Taming efficiency, as a percentage (0-1) |
| imprint | `number` | - | Imprint level, as a percentage (0-1) |
| mutMat | `number` | 0 | Number of mutations on the matriliineal line |
| mutPat | `number` | 0 | Number of mutations on the patriliineal line |
| mother_uuid | `string` | - | UUID of mother creature |
| father_uuid | `string` | - | UUID of father creature |
| owner | `string` | - | Free-form text field |
| tribe | `string` | - | Free-form text field |
| notes | `string` | - | Free-form text field |
