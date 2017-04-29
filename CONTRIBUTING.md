# Contributing

## Basic Steps

If you would like to contribute enhancements or fixes, please do the following:

1.  Fork the package repository
2.  Run `npm install` to setup all dependencies
3.  Hack on a separate topic branch created from the latest `master`. Changes to
    the package code should be made to the files in the `lib` directory.
4.  Check for lint errors with `npm test`.
5.  Commit the changes under `lib` and push the topic branch
6.  Make a pull request

## Styleguides

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally
* When only changing documentation, include `[ci skip]` in the commit description
* Consider starting the commit message with an applicable emoji:
    * :art: `:art:` when improving the format/structure of the code
    * :racehorse: `:racehorse:` when improving performance
    * :non-potable_water: `:non-potable_water:` when plugging memory leaks
    * :memo: `:memo:` when writing docs
    * :penguin: `:penguin:` when fixing something on Linux
    * :apple: `:apple:` when fixing something on macOS
    * :checkered_flag: `:checkered_flag:` when fixing something on Windows
    * :bug: `:bug:` when fixing a bug
    * :fire: `:fire:` when removing code or files
    * :green_heart: `:green_heart:` when fixing the CI build
    * :white_check_mark: `:white_check_mark:` when adding tests
    * :lock: `:lock:` when dealing with security
    * :arrow_up: `:arrow_up:` when upgrading dependencies
    * :arrow_down: `:arrow_down:` when downgrading dependencies
    * :shirt: `:shirt:` when removing linter warnings

### JavaScript Styleguide

Please note that modifications should follow these coding guidelines:

*   Indent is 2 spaces
*   Code should pass the `eslint` linter
*   Vertical whitespace helps readability, don’t be afraid to use it

## Releasing

Project members with push access to the repository also have the permissions
needed to release a new version.  If there have been changes to the project and
the team decides it is time for a new release, the process is to:

1. Update `CHANGELOG.md` with the planned version number and a short bulleted
list of major changes.  Include pull request numbers if applicable.
2. Commit the changelog and any `lib/` changes to master.
3. Publish a new version with `apm publish {major|minor|patch}`, using semver to
decide what type of version should be released.
4. `apm` will then automatically:
  * Update `package.json` with the new version number
  * Commit the changed `package.json` to master
  * Create a git tag for the new version and push it to GitHub
  * Publish the package to the Atom package manager

Thank you for helping out!
