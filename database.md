# Database Layout

General limitations:
 * IDs cannot be renamed. That makes names a bad option for an ID, but they can still be indexed as a secondary field.
 * Databases cannot be renamed. If we want to support multiple libraries then mappings to/from displayable names will have to be kept elsewhere.

Layout:
 * Settings DB - general application settings, unrelated to a specific library
 * Library DBs - many separate libraries, each containing creatures, servers and library-specific settings

## Settings

 * Designed for application-related settings only, so settings related to a library or server should be stored elsewhere.
 * Stored in a single entry inside a database called `settings`.
 * The only entry will have an ID of `settings` also.

Contents of the entry:
| Key | Type (jsdoc) | Description |
|-:|:-:|-|
| libraries | `{[name:string]:string}` | Library display name -> database name mapping |

## Libraries

 * Support multiple creature libraries.
 * Store each library in a different database, for good separation and performance.
 * It is not possible to rename databases after creation so each DB will need a unique, unchanging name.
 * Database names will be mapped from display names by maintaining a dictionary in Settings.
 * Each library database should be prefixed by `"library_"`.

Libraries need to contain:
 * Library-specific settings
 * Server definitions
 * Creature definitions

### Library Settings
 * Library-specific settings should be kept with an ID of `settings`.

Fields:
| Key | Type (jsdoc) | Default (if unset) | Description |
|-:|:-:|-|-|
| showDead | `boolean` | `true` | Whether to show creatures with status Dead |
| showUnavilable | `boolean` | `true` | Whether to show creatures with status Unavilable |
| librarySort | `string` | `"name"` | Column name to sort the lirary on |

### Server Defintions
Servers should be stored in the library database with an ID consisting of the prefix `server_`, followed by a UUID.

Fields:
| Key | Type (jsdoc) | Default (if unset) | Description |
|-:|:-:|-|-|
| name | `string` | - | User's name for the server |
| singlePlayer | `boolean` | `false` | Apply single player extra multipliers? |
| multipliers | `number[][]` | - | 8x4 array with multipliers, or null if not overridden from official |
| IBM | `boolean` | `1` | Imprint multiplier |
| wildLevelStep | `number?` | `1` | The size of the step between wild creature levels, or 1 if undefined |


### Creature Defintions
Creatures should be stored in the library database with an ID consisting of the prefix `creature_`, followed by its UUID. A creature's UUID is either imported or created at random.

If creatures reference pre-defined servers they may do so without including them in the servers list in the library.

Fields:
| Key | Type (jsdoc) | Default (if unset) | Description |
|-:|:-:|-|-|
| server_uuid | `string` | - | The server the creature was defined for |
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
