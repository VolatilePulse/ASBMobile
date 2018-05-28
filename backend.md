# Backend Planning

## Aims

* Single domain hosting the PWA and associated web services
* Ability to work with both ASBM and ASB
* Serve PWA for /, /css, /js, /img, /public, and all unknown links
* Handle authentication with 3rd party OAuth services: Google/Discord/etc
* Manage user accounts
* Manage libraries for individuals and groups
* Provide shareable links to creatures marked as public
* Provide metadata/embeds/unfurls for creature links
	* Serve oEmbed
	* Serve main index.html with modified meta

## URL layout

If the domain is to be shared between the PWA and back-end services it will need to be partitioned sensibly. The following back-end services are proposed:

| Path | Purpose |
|-|-|
|`/db`|Database API|
|`/auth`|Authentication API|
|`/api`|General control API|
|`/oembed`|oEmbed metadata API|
|`/invite`|Shareable invites to join groups|
|`/link`|Shareable links to public creatures|

Rich link previews in Discord/Facebook/Twitter/etc can be supported by implementing the oEmbed API and serving custom metadata on the `/invite` and `/link` endpoints.

All other URLs will be treated as part of the PWA, serving a plain file or falling back to serving the `index.html`. Expected PWA directories are:

| Path | Purpose |
|-|-|
|`/css`|css|
|`/js`|js|
|`/img`|images, mostly SVG|
|`/public`|data, including PWA manifest and species data|
|`*`|PWA's index.html|

## Authentication

Handle authentication with 3rd party OAuth services. Probably use [Passport.js](http://www.passportjs.org/) to support any providers we want.

Priority providers:
 * Google
 * Discord
 * Twitter
 * Facebook
 * GitHub

