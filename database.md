# Database Layout

Aims:
 * Store libraries, creatures, servers and settings.
 * Enable true data sync and offline support.
 * Allow full interop between ASB and ASBM.
 * Support a backend that provides access to libraries and authentication services.
 * Allow users to have multiple libraries.
 * Allow multiple users to share a library.

General limitations of synced NoSQL:
 * Content within data objects is essentially unformatted and unspecified.
 * IDs can never be changed due to sync support, so unique IDs must be used over names.

Google Firebase's Firestore database system is organised as collections and subcollections of documents: e.g. `library/{library_id}/creature/{creature_id}`

## User Roles

Each library has an owner, admins, members and pending members.

|Role|Meaning|
|-|-|
|Owner|Full control + only the owner can transfer a library to a different owner|
|Admin|Same as owner except cannot change owner or admins|
|Member|Creature management only|
|Pending Member|No rights at all - awaiting approval|

## Data Types

### User
A single user, authenticated by one or more 3rd party services.

Key : `string` : assigned by Firebase Auth (`uid`) and unique to our server.

#### Contains
|Field|Type|Description|
|-:|:-:|:-|
|`libraries`|`string[]`|A cache of library IDs accessible by the user.<br/>*Not used for permissions! Only used to reduce the need to query libraries.*|
|`settings`|`?`|User-specific settings (not device-specific, such as column layouts).<br/>Format TBD, to be useful for both ASB and ASBM|
|`color`|`string`|A color to use for the user's avatar when no image is available.|
|`displayName`|`string`|Name to use for the user when shown in member lists.|
|`photoURL`|`string`|URL to the user's avatar image. Should be cropped to a circle before display.|

Many other user fields are managed by Firebase Auth and kept separately. The customisable fields in this document are made available to facilitate library membership management.

#### Subcollections
None yet.

#### Permissions
|Action|Restricted to|
|-|-|
|Create|Only when new user_id == auth.uid|
|Update|Only when existing user_id == auth.uid|
|Delete|Only when existing user_id == auth.uid|
|Read|Only when user_id == auth.uid|
|List|Never|

### Library
Represents a collections of creatures on a cluster of servers, owned by one user and possibly shared with others.

Key : `string` : Randomly assigned unique string.

#### Contains
|Field|Type|Description|
|-:|:-:|:-|
|`name`|`string`|Display name, visible to others|
|`owner`|`string`|Owner of the library|
|`admins`|`string[]`|Array of user_ids of administrators of this library|
|`members`|`string[]`|Array of user_ids of members of this library|
|`pending`|`string[]`|Array of user_ids of unapproved members of this library|
|`settings`|`?`|TBD, in a format useful for both ASB and ASBM|

#### Subcollections
|Name|Description|
|-|-|
|`server`|Server definitions|
|`creature`|Creatures data|

#### Permissions
|Action|Restricted to|
|-|-|
|Create|Only when new owner == auth.uid|
|Update (including owner field)|Only when existing owner == auth.uid|
|Update (not including owner field)|Only when existing owner == auth.uid or auth.uid in existing admins|
|Delete|Only when owner == auth.uid|
|Read|Only when owner == auth.uid or auth.uid in admins or auth.uid in members|
|List|Never|

### Server
Contains multipliers and other values related a specific server.

Key : `string` : Randomly assigned unique string.

#### Contains
|Field|Type|Description|
|-:|:-:|:-|
|`name`|`string`|Display name|
|`multipliers`|`number[][]`|Nested objects acting like a 2D array of multipliers by stat then paramater (order TBD)|
|`singlePlayer`|`boolean`|True to enable single-player settings|
|`IBM`|`number`|IBM|
|`mods`|`string[]`|Array of Steam mod IDs, which should be applied in order

#### Permissions
|Action|Restricted to|
|-|-|
|Create|Only when owner == auth.uid or auth.uid in admins|
|Update|Only when owner == auth.uid or auth.uid in admins|
|Delete|Only when owner == auth.uid or auth.uid in admins **(reject if any creatures have this server as origin)**|
|Read|Only when owner == auth.uid or auth.uid in admins or auth.uid in members|
|List|Only when owner == auth.uid or auth.uid in admins or auth.uid in members|

### Creature
Contains all of the data that represents a creature.

Key : `string` : UUID from Ark or randomly assigned unique string.

#### Contains
...see the `Creature` interface in `src/data/firestore/objects.ts`...

#### Permissions
|Action|Restricted to|
|-|-|
|Create|Only when owner == auth.uid or auth.uid in admins or auth.uid in members|
|Update|Only when owner == auth.uid or auth.uid in admins or auth.uid in members|
|Delete|Only when owner == auth.uid or auth.uid in admins|
|Read|Only when owner == auth.uid or auth.uid in admins or auth.uid in members|
|List|Only when owner == auth.uid or auth.uid in admins or auth.uid in members|

### Invite
A record of an invite to join a particular library. Can be used by anyone, but only adds the user to the pending members list, ready for approval.

Key : `string` : Randomly assigned unique string.

#### Contains
|Field|Type|Description|
|-:|:-:|:-|
|`target`|`string`|Library ID that the invite refers to|
|`creator`|`string`|UID of the user that created the invite|
|`expires`|`timestamp`|Time at which the invite becomes invalid|
|`persistent`|`boolean`|If false, allow only a single use|

#### Permissions
|Action|Restricted to|
|-|-|
|Create|Only when creator == auth.uid and (creator == library.owner || creator in library.admins)
|Update|Never|
|Delete|Never|
|Read|Open, even to unauthorised clients|
|List|Never|

## Mainenance

Regularly scheduled batch operations:

### Weekly
 * Expired invites should be deleted.
 * Obsolete servers that own no creatures should be deleted.
