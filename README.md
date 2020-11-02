# ezplatform-admin-ui-assets

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

## Legal Notice

The use of the graphical icons form Webalys LLC placed in this repository or file are to be used only together with Ibexa Open Source that is licensed under the GNU General Public License v. 2 (GPL). The use and distribution of the icons is subject to the Ibexa Icon License Agreement also placed in this repository.