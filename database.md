# Database Layout

Aims:
 * Store libraries, creatures, servers and settings.
 * Enable true data sync and offline support.
 * Allow full interop between ASB and ASBM.
 * Support a backend that provides access to libraries and authentication services.
 * Allow users to have multiple libraries.
 * Allow groups of users to have access to shared libraries.

General limitations:
 * Pouch/Couch databases are part way between a relational database and a single relational table.
 * Content within data objects is essentially unformatted and unspecified.
 * IDs can never be changed due to sync support, so unique IDs must be used over names.
 * In the web client databases cannot be renamed. To support multiple libraries we must maintain mappings to/from displayable names.

Syncing:
 * It is intended for clients to maintain a synced copy of relevant databases.

## Data Layout

Relationships:

* A User has authentication sources, settings and a list of personal Libraries.
* A Group has an owner User, settings, a list of member Users and a list of personal Libraries.
* A Library has an owner, settings, any number of Servers and any number of Creatures.

Separate databases will exist for each...
* Library
* User and Group, despite only containing one single object each (to support sync)

## Permissions

Access to each database will be limited:
 * Users and Groups are limited to their owner or members
 * Libraries are limited in the same way as the owner (either a User or Group)

It also also planned to be able to mark a creature as 'public' and obtain a shareable link to view on the website. This will not confer database access in any way.

There will be no unauthenticated access to Users/Groups or Libraries.

## Authentication

Authentication is via 3rd parties only, based on OAuth2. It should be possible to link multiple 3rd party accounts with one user for potential future features.

## Object IDs

To support multiple types of object within one database it is common to prefix the object IDs with the type of the data. We will follow this scheme and also sometimes include a secondary prefix that shows the type and/or source of the ID. Where a unique ID is not already available a CUID will be generated and used. CUID was chosen due to its smaller size, lower costs and collision resistance.

(CUID has both [Javascript](https://github.com/ericelliott/cuid) and [.Net](https://github.com/stewart-ritchie/ncuid) implementations)

### Creature IDs

Creature IDs are prefixed with `creature:` when stored and use a secondary prefix to denote their source. All IDs are strings.

|2nd Prefix|Data Source|ID Type|
|-|-|-|
|`input:`|User entered data manually|A CUID|
|`ark_export:`|Imported ARK creature .ini file|UUID from DinoID1 and DinoID2 using ark-tools method|
|`ark_tools:`|Imported from ark-tools output|UUID taken directly from ark-tools|

An example ID when stored in the database: `creature:input:cjhluzqzx000001t36u2hod58`.

### Server IDs

Server IDs are prefixed with `server:` when stored and use a secondary prefix based on their source, with special values being used to identify common pre-defined servers.

|2nd Prefix|Data Source|ID Type|
|-|-|-|
|`predef:`|Predefined|One of the predefined server IDs|
|`test:`|Dev-only test servers|Server name|
|`input:`|User entered data manually|CUID|
|`game_ini:`|Imported from a Game.ini file|CUID|

Predefined servers are intended to remove the need to create a server definition where the user is using Official or potentially also very popular 3rd party servers, if we decide to add them. Once defined they can never be removed, only hidden. Note that they are **not** stored in any database.

Current predefined servers:

|ID|Meaning|
|-|-|
|`server:predef:Official Server`|Official Server settings|
|`server:predef:Official Single Player`|Official Server settings with Single Player enabled|

An example ID when stored in the database: `server:game_ini:cjhlvclcv000001o4es3v3r6f`.



# Old...

Layout:
 * In order to best fit our data we should split object types into different databases.
 * Settings DB - general application settings and settings related to specific libraries
 * Library Servers DBs - separate DB for each library, containing only servers
 * Library Creature DBs - separate DB for each library, containing only creatures

## Settings
 * Contains application settings and settings for each library.
 * Application settings should be stored in a single entry with the index `settings`.
 * Library settings should be stored in entries named after the library ID.

Contents of the application `settings` entry:
| Key | Type | Description |
|-:|:-:|-|
| libraries | `{[name:string]:string}` | Library display name -> database name mapping |

Contents of library settings entries:
| Key | Type | Default | Description |
|-:|:-:|-|-|
| showDead | `boolean` | `true` | Whether to show creatures with status Dead |
| showUnavailable | `boolean` | `true` | Whether to show creatures with status Unavailable |
| librarySort | `string` | `"name"` | Column name to sort the library on |

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
| mutMat | `number` | 0 | Number of mutations on the matrilineal line |
| mutPat | `number` | 0 | Number of mutations on the patrilineal line |
| mother_uuid | `string` | - | UUID of mother creature |
| father_uuid | `string` | - | UUID of father creature |
| owner | `string` | - | Free-form text field |
| tribe | `string` | - | Free-form text field |
| notes | `string` | - | Free-form text field |
