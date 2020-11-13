#! /bin/sh
# Script to prepare a ezplatform-admin-ui-assets bundle release

[ ! -f "bin/prepare_release.sh" ] && echo "This script has to be run the root of the bundle" && exit 1

print_usage()
{
    echo "Create a new version of ezplatform-admin-ui-assets bundle by creating a local tag"
    echo "This script MUST be run from the bundle root directory. It will create"
    echo "a tag but this tag will NOT be pushed"
    echo ""
    echo "Usage: $1 -v <version> -b <branch>"
    echo "-v : where version will be used to create the tag"
    echo "-b : branch which will be used to create the tag"
}

VERSION=""
BRANCH=""
while getopts ":h:v:b:" opt ; do
    case $opt in
        v ) VERSION=$OPTARG ;;
        b ) BRANCH=$OPTARG ;;
        h ) print_usage "$0"
            exit 0 ;;
        * ) print_usage "$0"
            exit 2 ;;
    esac
done

[ -z "$BRANCH" ] && print_usage "$0" && exit 2
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
check_command "npm"

VENDOR_DIR="Resources/public/vendors/"
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
REACT_DOM_DIR="$VENDOR_DIR/react-dom"
REACT_DOM_NOTICE="$REACT_DOM_DIR/REACT_DOM_IN_EZPLATFORMADMINUIASSETS.txt"
TAGGIFY_DIR="$VENDOR_DIR/taggify"
TAGGIFY_NOTICE="$TAGGIFY_DIR/TAGGIFY_IN_EZPLATFORMADMINUIASSETS.txt"
MOMENT_DIR="$VENDOR_DIR/moment"
MOMENT_NOTICE="$MOMENT_DIR/MOMENT_IN_EZPLATFORMADMINUIASSETS.txt"
MOMENT_TIMEZONE_DIR="$VENDOR_DIR/moment-timezone"
MOMENT_TIMEZONE_NOTICE="$MOMENT_TIMEZONE_DIR/MOMENT_TIMEZONE_IN_EZPLATFORMADMINUIASSETS.txt"
D3_DIR="$VENDOR_DIR/d3"
D3_NOTICE="$D3_DIR/D3_IN_EZPLATFORMUIASSETS.txt"
DAGRE_D3_DIR="$VENDOR_DIR/dagre-d3"
DAGRE_D3_NOTICE="$DAGRE_D3_DIR/DAGRE_D3_IN_EZPLATFORMUIASSETS.txt"

CURRENT_BRANCH=`git branch | grep '*' | cut -d ' ' -f 2`
TMP_BRANCH="version_$VERSION"
TAG="v$VERSION"

echo "# Switching to $BRANCH and updating"
git checkout -q $BRANCH > /dev/null && git pull > /dev/null
check_process "switch to $BRANCH"

echo "# Removing the assets"
[ ! -d "$VENDOR_DIR" ] && mkdir -p $VENDOR_DIR
[ -d "$VENDOR_DIR" ] && rm -rf $VENDOR_DIR/*
check_process "clean the vendor dir $VENDOR_DIR"

echo "# Installing dependendencies"
npm install
npm run prepare-release

echo "# Removing unused files from Alloy Editor"
rm -rf "$ALLOY_DIR/api" "$ALLOY_DIR/api-theme" "$ALLOY_DIR/gulp-tasks" "$ALLOY_DIR/lib" "$ALLOY_DIR/src" "$ALLOY_DIR/test" "$ALLOY_DIR/dist/.gitignore" $ALLOY_DIR/dist/alloy-editor/alloy-editor-all-min.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-all.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-core-min.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-core.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-no-ckeditor-min.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-no-ckeditor.js $ALLOY_DIR/dist/alloy-editor/alloy-editor-no-react.js $ALLOY_DIR/dist/alloy-editor/BREAKING_CHANGES.md $ALLOY_DIR/dist/alloy-editor/CHANGELOG.md $ALLOY_DIR/.editorconfig $ALLOY_DIR/.eslintrc.js $ALLOY_DIR/.jshintrc $ALLOY_DIR/.travis.yml $ALLOY_DIR/bower.json $ALLOY_DIR/BREAKING_CHANGES.md $ALLOY_DIR/CHANGELOG.md $ALLOY_DIR/gulpfile.js $ALLOY_DIR/README.md $ALLOY_DIR/yarn.lock
check_process "clean alloyeditor"
echo "This is a customized Alloy Editor version." > $ALLOY_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $ALLOY_NOTICE

echo "# Removing unused files from Bootstrap"
rm -rf "$BOOTSTRAP_DIR/build" "$BOOTSTRAP_DIR/dist/css" "$BOOTSTRAP_DIR/js" $BOOTSTRAP_DIR/dist/js/bootstrap.js $BOOTSTRAP_DIR/dist/js/bootstrap.js.map $BOOTSTRAP_DIR/dist/js/bootstrap.bundle.js $BOOTSTRAP_DIR/dist/js/bootstrap.bundle.js.map $BOOTSTRAP_DIR/dist/js/bootstrap.bundle.min.js $BOOTSTRAP_DIR/dist/js/bootstrap.bundle.min.js.map $BOOTSTRAP_DIR/.eslintignore $BOOTSTRAP_DIR/Gemfile
check_process "clean bootstrap"
echo "This is a customized Bootstrap version." > $BOOTSTRAP_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $BOOTSTRAP_NOTICE

echo "# Removing unused files from Flatpickr"
rm -rf "$FLATPICKR_DIR/src" $FLATPICKR_DIR/dist/flatpickr.css $FLATPICKR_DIR/dist/flatpickr.js $FLATPICKR_DIR/dist/ie.css $FLATPICKR_DIR/.jest.json $FLATPICKR_DIR/.jest.ssr.json $FLATPICKR_DIR/.travis.yml $FLATPICKR_DIR/index.d.ts $FLATPICKR_DIR/tsconfig.json $FLATPICKR_DIR/README.md
check_process "clean flatpickr"
echo "This is a customized Flatpickr version." > $FLATPICKR_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $FLATPICKR_NOTICE

echo "# Removing unused files from jQuery"
rm -rf "$JQUERY_DIR/external" "$JQUERY_DIR/src" $JQUERY_DIR/dist/core.js $JQUERY_DIR/dist/jquery.js $JQUERY_DIR/dist/jquery.min.map $JQUERY_DIR/dist/jquery.slim.js $JQUERY_DIR/dist/jquery.slim.min.js $JQUERY_DIR/dist/jquery.slim.min.map $JQUERY_DIR/AUTHORS.txt $JQUERY_DIR/bower.json $JQUERY_DIR/README.md
check_process "clean jquery"
echo "This is a customized jQuery version." > $JQUERY_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $JQUERY_NOTICE

echo "# Removing unused files from Leaflet"
rm -rf "$LEAFLET_DIR/src" $LEAFLET_DIR/CHANGELOG.md $LEAFLET_DIR/README.md
check_process "clean Leaflet"
echo "This is a customized Leaflet version." > $LEAFLET_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $LEAFLET_NOTICE

echo "# Removing unused files from Popper"
rm -rf "$POPPER_DIR/dist/esm" "$POPPER_DIR/.tmp" "$POPPER_DIR/packages" $POPPER_DIR/dist/popper-utils.js $POPPER_DIR/dist/popper-utils.js.map $POPPER_DIR/dist/popper-utils.min.js $POPPER_DIR/dist/popper-utils.min.js.map $POPPER_DIR/dist/popper.js $POPPER_DIR/dist/popper.js.map $POPPER_DIR/dist/popper.min.js $POPPER_DIR/dist/popper.min.js.map $POPPER_DIR/dist/umd/popper-utils.js $POPPER_DIR/dist/umd/popper-utils.js.map $POPPER_DIR/dist/umd/popper-utils.min.js $POPPER_DIR/dist/umd/popper-utils.min.js.map $POPPER_DIR/dist/umd/popper.js $POPPER_DIR/dist/umd/popper.js.map $POPPER_DIR/.eslintignore $POPPER_DIR/.eslintrc.js $POPPER_DIR/index.d.ts
check_process "clean popper.js"
echo "This is a customized Popper.js version." > $POPPER_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $POPPER_NOTICE

echo "# Removing unused files from react"
rm -rf "$REACT_DIR/lib" "$REACT_DIR/node_modules" $REACT_DIR/react.js $REACT_DIR/dist/react-with-addons.js $REACT_DIR/dist/react-with-addons.min.js
check_process "clean React"
echo "This is a customized React version." > $REACT_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $REACT_NOTICE

echo "# Removing unused files from react-dom"
rm -rf "$REACT_DOM_DIR/lib" "$REACT_DOM_DIR/node_modules" $REACT_DOM_DIR/index.js $REACT_DOM_DIR/server.js $REACT_DOM_DIR/test-utils.js $REACT_DOM_DIR/dist/react-dom-server.js $REACT_DOM_DIR/dist/react-dom-server.min.js
check_process "clean ReactDOM"
echo "This is a customized ReactDOM version." > $REACT_DOM_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $REACT_DOM_NOTICE

echo "# Removing unused files from taggify"
rm -rf "$TAGGIFY_DIR/test" "$TAGGIFY_DIR/src/css" $TAGGIFY_DIR/src/js/taggify-script.js $TAGGIFY_DIR/src/js/taggify.es6.js $TAGGIFY_DIR/src/js/taggify.min.js.gz $TAGGIFY_DIR/.bower.json $TAGGIFY_DIR/.gitignore $TAGGIFY_DIR/.travis.yml $TAGGIFY_DIR/db.json $TAGGIFY_DIR/gulpfile.js $TAGGIFY_DIR/index.html $TAGGIFY_DIR/karma.conf.js $TAGGIFY_DIR/module-generator.js $TAGGIFY_DIR/taggify-comment.js $TAGGIFY_DIR/template.common.js $TAGGIFY_DIR/template.es6.js
check_process "clean Taggify"
echo "This is a customized Taggify version." > $TAGGIFY_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $TAGGIFY_NOTICE

echo "# Removing unused files from create-react-class"
rm -rf "$CREATE_REACT_CLASS_DIR/node_modules" $CREATE_REACT_CLASS_DIR/create-react-class.js $CREATE_REACT_CLASS_DIR/factory.js $CREATE_REACT_CLASS_DIR/index.js $CREATE_REACT_CLASS_DIR/README.md
check_process "clean create-react-class"
echo "This is a customized create-react-class version." > $CREATE_REACT_CLASS_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $CREATE_REACT_CLASS_NOTICE

echo "# Removing unused files from prop-types"
rm -rf "$PROP_TYPES_DIR/lib" "$PROP_TYPES_DIR/node_modules" $PROP_TYPES_DIR/CHANGELOG.md $PROP_TYPES_DIR/checkPropTypes.js $PROP_TYPES_DIR/factory.js $PROP_TYPES_DIR/factoryWithThrowingShims.js $PROP_TYPES_DIR/factoryWithTypeCheckers.js $PROP_TYPES_DIR/index.js $PROP_TYPES_DIR/prop-types.js $PROP_TYPES_DIR/README.md
check_process "clean prop-types"
echo "This is a customized prop-types version." > $PROP_TYPES_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $PROP_TYPES_NOTICE

echo "# Removing unused files from moment"
rm -rf "$MOMENT_DIR/src"
check_process "clean moment"
echo "This is a customized moment version." > $MOMENT_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $MOMENT_NOTICE

echo "# Removing unused files from moment-timezone"
rm -rf "$MOMENT_TIMEZONE_DIR/data"
check_process "clean moment-timezone"
echo "This is a customized moment version." > $MOMENT_TIMEZONE_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $MOMENT_TIMEZONE_NOTICE

echo "# Removing unused files from d3"
rm -rf "$D3_DIR/node_modules" $D3_DIR/API.md $D3_DIR/CHANGES.md $D3_DIR/index.js $D3_DIR/ISSUE_TEMPLATE.md $D3_DIR/rollup.config.js $D3_DIR/rollup.node.js $D3_DIR/dist/d3.node.js $D3_DIR/dist/package.js
check_process "clean d3"
echo "This is a customized d3 version." > $D3_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $D3_NOTICE

echo "# Removing unused files from dagre-d3"
rm -rf "$DAGRE_D3_DIR/node_modules" "$DAGRE_D3_DIR/lib" "$DAGRE_D3_DIR/dist/demo" $DAGRE_D3_DIR/.jscsrc $DAGRE_D3_DIR/.jshintrc $DAGRE_D3_DIR/bower.json $DAGRE_D3_DIR/index.js $DAGRE_D3_DIR/karma.conf.js $DAGRE_D3_DIR/karma.core.conf.js $DAGRE_D3_DIR/dist/dagre-d3.core.js $DAGRE_D3_DIR/dist/dagre-d3.core.min.js $DAGRE_D3_DIR/dist/dagre-d3.core.min.js.map
check_process "clean dagre-d3"
echo "This is a customized dagre-d3 version." > $DAGRE_D3_NOTICE
echo "To decrease the size of the bundle, it includes production-only files" >> $DAGRE_D3_NOTICE

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
