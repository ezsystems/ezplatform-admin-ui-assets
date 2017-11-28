#! /bin/sh
# Script to prepare a ezplatform-admin-ui-assets bundle release

[ ! -f "bin/prepare_release.sh" ] && echo "This script has to be run the root of the bundle" && exit 1

print_usage()
{
    echo "Create a new version of ezplatform-admin-ui-assets bundle by creating a local tag"
    echo "This script MUST be run from the bundle root directory. It will create"
    echo "a tag but this tag will NOT be pushed"
    echo ""
    echo "Usage: $1 -v <version>"
    echo "-v version : where version will be used to create the tag"
}

VERSION=""
while getopts "hv:" opt ; do
    case $opt in
        v ) VERSION=$OPTARG ;;
        h ) print_usage "$0"
            exit 0 ;;
        * ) print_usage "$0"
            exit 2 ;;
    esac
done

[ -z "$VERSION" ] && print_usage "$0" && exit 2

check_command()
{
    $1 --version 2>&1 > /dev/null
    check_process "find '$1' in the PATH, is it installed?"
}

check_process()
{
    [ $? -ne 0 ] && echo "Fail to $1" && exit 3
}

check_command "git"
check_command "bower"

VENDOR_DIR=`cat .bowerrc | grep "directory" | cut -d ':' -f 2 | sed 's/[ "]//g'`
ALLOY_DIR="$VENDOR_DIR/alloyeditor"
ALLOY_NOTICE="$ALLOY_DIR/ALLOY_IN_EZPLATFORMADMINUIASSETS.txt"
BOOTSTRAP_DIR="$VENDOR_DIR/bootstrap"
BOOTSTRAP_NOTICE="$BOOTSTRAP_DIR/BOOTSTRAP_IN_EZPLATFORMADMINUIASSETS.txt"
FLATPICKR_DIR="$VENDOR_DIR/flatpickr"
FLATPICKR_NOTICE="$FLATPICKR_DIR/FLATPICKR_IN_EZPLATFORMADMINUIASSETS.txt"
JQUERY_DIR="$VENDOR_DIR/jquery"
JQUERY_NOTICE="$JQUERY_DIR/JQUERY_IN_EZPLATFORMADMINUIASSETS.txt"
LEAFLET_DIR="$VENDOR_DIR/leaflet"
LEAFLET_NOTICE="$LEAFLET_DIR/LEAFLET_IN_EZPLATFORMADMINUIASSETS.txt"
POPPER_DIR="$VENDOR_DIR/popper.js"
POPPER_NOTICE="$POPPER_DIR/POPPER_IN_EZPLATFORMADMINUIASSETS.txt"
REACT_DIR="$VENDOR_DIR/react"
REACT_NOTICE="$REACT_DIR/REACT_IN_EZPLATFORMADMINUIASSETS.txt"
TAGGIFY_DIR="$VENDOR_DIR/taggify"
TAGGIFY_NOTICE="$TAGGIFY_DIR/TAGGIFY_IN_EZPLATFORMADMINUIASSETS.txt"

CURRENT_BRANCH=`git branch | grep '*' | cut -d ' ' -f 2`
TMP_BRANCH="version_$VERSION"
TAG="v$VERSION"

echo "# Switching to master and updating"
git checkout -q master > /dev/null && git pull > /dev/null
check_process "switch to master"

echo "# Removing the assets"
[ ! -d "$VENDOR_DIR" ] && mkdir -p $VENDOR_DIR
[ -d "$VENDOR_DIR" ] && rm -rf $VENDOR_DIR/*
check_process "clean the vendor dir $VENDOR_DIR"

echo "# Bower install"
bower install
check_process "run bower"
npm run build-flatpickr

echo "# Removing unused files from Alloy Editor"
rm -rf "$ALLOY_DIR/api" "$ALLOY_DIR/api-theme" "$ALLOY_DIR/gulp-tasks" "$ALLOY_DIR/lib" "$ALLOY_DIR/src" "$ALLOY_DIR/test" $ALLOY_DIR/dist/alloy-editor/alloy-editor-all-min.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-all.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-core-min.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-core.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-no-ckeditor-min.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-no-ckeditor.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-no-react.js $ALLOY_DIR/dist/alloy-editor/BREAKING_CHANGES.md $ALLOY_DIR/.bower.json $ALLOY_DIR/bower.json $ALLOY_DIR/BREAKING_CHANGES.md $ALLOY_DIR/gulpfile.js $ALLOY_DIR/README.md $ALLOY_DIR/yarn.lock
check_process "clean alloyeditor"
echo "This is a customized Alloy Editor version." > $ALLOY_NOTICE
echo "To decrease the size of the bundle, it includes only the dist folder" >> $ALLOY_NOTICE

echo "# Removing unused files from Bootstrap"
rm -rf "$BOOTSTRAP_DIR/build" "$BOOTSTRAP_DIR/dist/css" "$BOOTSTRAP_DIR/js" $BOOTSTRAP_DIR/dist/js/bootstrap.js $BOOTSTRAP_DIR/.bower.json $BOOTSTRAP_DIR/apple-touch-icon.png $BOOTSTRAP_DIR/bower.json $BOOTSTRAP_DIR/favicon.ico $BOOTSTRAP_DIR/Gemfile $BOOTSTRAP_DIR/Gemfile.lock $BOOTSTRAP_DIR/index.html $BOOTSTRAP_DIR/package-lock.json $BOOTSTRAP_DIR/package.js $BOOTSTRAP_DIR/robots.txt $BOOTSTRAP_DIR/sache.json $BOOTSTRAP_DIR/README.md
check_process "clean bootstrap"
echo "This is a customized Bootstrap version." > $BOOTSTRAP_NOTICE
echo "To decrease the size of the bundle, it does include scss and dist/js folders only" >> $BOOTSTRAP_NOTICE

echo "# Removing unused files from Flatpickr"
rm -rf "$FLATPICKR_DIR/node_modules" "$FLATPICKR_DIR/src" $FLATPICKR_DIR/dist/flatpickr.css $FLATPICKR_DIR/dist/ie.css $FLATPICKR_DIR/.bower.json $FLATPICKR_DIR/bower.json $FLATPICKR_DIR/build.ts $FLATPICKR_DIR/CONTRIBUTING.md $FLATPICKR_DIR/custom.d.ts $FLATPICKR_DIR/index.d.ts $FLATPICKR_DIR/ISSUE_TEMPLATE.md $FLATPICKR_DIR/README.md $FLATPICKR_DIR/rollup.config.js $FLATPICKR_DIR/tsconfig.json $FLATPICKR_DIR/zip-release $FLATPICKR_DIR/yarn.lock $FLATPICKR_DIR/package-lock.json
check_process "clean flatpickr"
echo "This is a customized Flatpickr version." > $FLATPICKR_NOTICE
echo "To decrease the size of the bundle, it includes the dist/ folder only" >> $FLATPICKR_NOTICE

echo "# Removing unused files from jQuery"
rm -rf "$JQUERY_DIR/external" "$JQUERY_DIR/src" $JQUERY_DIR/dist/core.js $JQUERY_DIR/dist/jquery.js $JQUERY_DIR/dist/jquery.min.map $JQUERY_DIR/dist/jquery.slim.js $JQUERY_DIR/dist/jquery.slim.min.js $JQUERY_DIR/dist/jquery.slim.min.map $JQUERY_DIR/dist/.bower.json $JQUERY_DIR/AUTHORS.txt $JQUERY_DIR/bower.json $JQUERY_DIR/README.md $JQUERY_DIR/.bower.json
check_process "clean jquery"
echo "This is a customized jQuery version." > $JQUERY_NOTICE
echo "To decrease the size of the bundle, it includes only the minified version of jQuery library" >> $JQUERY_NOTICE

echo "# Removing unused files from Leaflet"
rm -rf "$LEAFLET_DIR/docs" $LEAFLET_DIR/.bower.json $LEAFLET_DIR/bower.json $LEAFLET_DIR/CHANGELOG.md $LEAFLET_DIR/CONTRIBUTING.md $LEAFLET_DIR/ISSUE_TEMPLATE.md $LEAFLET_DIR/Jakefile.js $LEAFLET_DIR/PLUGIN-GUIDE.md $LEAFLET_DIR/README.md
check_process "clean Leaflet"
echo "This is a customized Leaflet version." > $LEAFLET_NOTICE
echo "To decrease the size of the bundle, it includes production files only" >> $LEAFLET_NOTICE

echo "# Removing unused files from Popper"
rm -rf "$POPPER_DIR/dist/esm" "$POPPER_DIR/docs" "$POPPER_DIR/packages" $POPPER_DIR/popper-utils.js $POPPER_DIR/popper-utils.js.map $POPPER_DIR/popper-utils.min.js $POPPER_DIR/popper-utils.min.js.map $POPPER_DIR/popper.js $POPPER_DIR/popper.js.map $POPPER_DIR/popper.min.js $POPPER_DIR/popper.min.js.map $POPPER_DIR/umd/popper-utils.js $POPPER_DIR/umd/popper-utils.js.map $POPPER_DIR/umd/popper-utils.min.js $POPPER_DIR/umd/popper-utils.min.js.map $POPPER_DIR/umd/popper.js $POPPER_DIR/umd/popper.js.map $POPPER_DIR/umd/popper.min.js.map $POPPER_DIR/.bower.json $POPPER_DIR/bower.json $POPPER_DIR/CHANGELOG.md $POPPER_DIR/CODE_OF_CONDUCT.md $POPPER_DIR/CONTRIBUTING.md $POPPER_DIR/lerna.json $POPPER_DIR/MENTIONS.md $POPPER_DIR/popperjs.png $POPPER_DIR/README.md $POPPER_DIR/yarn.lock
check_process "clean popper.js"
echo "This is a customized Popper.js version." > $POPPER_NOTICE
echo "To decrease the size of the bundle, it includes only the minified version of Popper.js library" >> $POPPER_NOTICE

echo "# Removing unused files from react"
rm -rf $REACT_DIR/.bower.json $REACT_DIR/bower.json $REACT_DIR/react-dom-server.js $REACT_DIR/react-dom-server.min.js $REACT_DIR/react-with-addons.js $REACT_DIR/react-with-addons.min.js $REACT_DIR/react-dom.js $REACT_DIR/react.js
check_process "clean React"
echo "This is a customized React version." > $REACT_NOTICE
echo "To decrease the size of the bundle, it does not include development-only files" >> $REACT_NOTICE

echo "# Removing unused files from taggify"
rm -rf "$TAGGIFY_DIR/test" "$TAGGIFY_DIR/src/css" $TAGGIFY_DIR/src/js/taggify-script.js $TAGGIFY_DIR/src/js/taggify.es6.js $TAGGIFY_DIR/src/js/taggify.min.js.gz $TAGGIFY_DIR/.bower.json $TAGGIFY_DIR/.gitignore $TAGGIFY_DIR/.travis.yml $TAGGIFY_DIR/db.json $TAGGIFY_DIR/gulpfile.js $TAGGIFY_DIR/index.html $TAGGIFY_DIR/karma.conf.js $TAGGIFY_DIR/module-generator.js $TAGGIFY_DIR/taggify-comment.js $TAGGIFY_DIR/template.common.js $TAGGIFY_DIR/template.es6.js
check_process "clean Taggify"
echo "This is a customized Taggify version." > $TAGGIFY_NOTICE
echo "To decrease the size of the bundle, it includes production JS scripts only" >> $TAGGIFY_NOTICE

echo "# Creating the custom branch: $TMP_BRANCH"
git checkout -q -b "$TMP_BRANCH" > /dev/null
check_process "create the branch '$TMP_BRANCH'"

echo "# Commiting"
git add Resources > /dev/null
git commit -q -m "Version $VERSION"
check_process "commit the assets"

echo "# Tagging $TAG"
git tag "$TAG"
check_process "to tag the version '$TAG'"

echo "# Switching back to '$CURRENT_BRANCH'"
git checkout -q "$CURRENT_BRANCH" > /dev/null
check_process "to switch back to '$CURRENT_BRANCH'"

echo "# Removing the custom branch '$TMP_BRANCH'"
git branch -D "$TMP_BRANCH" > /dev/null
check_process "to remove the branch '$TMP_BRANCH'"

echo ""
echo "The tag '$TAG' has been created, please check that everything is correct"
echo "then you can run:"
echo "  git push origin $TAG"
echo "and create the corresponding release on Github"
echo "https://github.com/ezsystems/ezplatform-admin-ui-assets/releases"
