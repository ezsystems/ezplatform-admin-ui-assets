# Ibexa AdminUI assets

## Installing dependencies

1. `npm install`
2. `npm run prepare-release`

## Preparing a tag for release

To prepare a tag for release you have to run the following command from the root directory of the bundle:

```
sh bin/prepare_release.sh -v 1.0.0 -b master
```

Options:
1. -v : tag that will be released
1. -b : branch which will be used to create the tag

If you are tagging for eZPlatform 2.5.x LTS you should use the 4.x branch.

## COPYRIGHT
Copyright (C) 1999-2021 Ibexa AS (formerly eZ Systems AS). All rights reserved.

## LICENSE
This source code is available separately under the following licenses:

A - Ibexa Business Use License Agreement (Ibexa BUL),
version 2.3 or later versions (as license terms may be updated from time to time)
Ibexa BUL is granted by having a valid Ibexa DXP (formerly eZ Platform Enterprise) subscription,
as described at: https://www.ibexa.co/product
For the full Ibexa BUL license text, please see:
https://www.ibexa.co/software-information/licenses-and-agreements (latest version applies)

AND

B - GNU General Public License, version 2
Grants an copyleft open source license with ABSOLUTELY NO WARRANTY. For the full GPL license text, please see:
https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
