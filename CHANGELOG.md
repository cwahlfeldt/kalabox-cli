v0.12.0-beta2
=============

#### Bug Fixes

* Removed internal `kalabox-pantheon` and `kalabox-php` plugins in favor of newly-consolidated `kalabox-app-pantheon` and `kalabox-app-php` plugins. [#1223](https://github.com/kalabox/kalabox/issues/1223)

v0.12.0-beta1
=============

### Bug Fixes

* Updated the `kbox destroy` confirmation warning to accurately reflect what `kbox destroy` does. [#1288](https://github.com/kalabox/kalabox/issues/1288)
* Changed kbox.app.get to match on appName or appName with hyphens removed. [#1306](https://github.com/kalabox/kalabox/issues/1306)
* Removed code no longer needed that was resulting in duplicate 'Pulling image <image_name>' messages in the cli. [#1285](https://github.com/kalabox/kalabox/issues/1285)

v0.12.0-alpha24
===============

#### Enhancements

* Added `python`, `make` and `g++` to the `kalabox\cli` image. [#1263](https://github.com/kalabox/kalabox/issues/1263)

#### New Features

* Updated our development process with new contribution guidelines and standards [#1236](https://github.com/kalabox/kalabox/issues/1236)

#### Bug fixes

* Added kbox.app.exists and kbox.app.nextAppName in [#1235](https://github.com/kalabox/kalabox/issues/1235) for use in [#1258](https://github.com/kalabox/kalabox/issues/1258)
* Changed syncthing rescan interval to always be 2 seconds. [#1199](https://github.com/kalabox/kalabox/issues/1199)
* Implemented app specific status messages. [#1255](https://github.com/kalabox/kalabox/issues/1255)
* Changed syncthing to try starting if a restart has failed to put it in the up state. This was usually encountered when running multiple app actions in the GUI. [#1228](https://github.com/kalabox/kalabox/issues/1228)
* Changed app destroy action to remove the app's directory. [#1232](https://github.com/kalabox/kalabox/issues/1232)
* Added kalabox-ui plugin which manages a token container to enable app state and events via docker events stream. [#1160](https://github.com/kalabox/kalabox/issues/1160)
* Disregard hyphens when checking if an app already exists with app.exists(appName).
* Changed docker events query to include all events since docker was started. [#1290](https://github.com/kalabox/kalabox/issues/1290)
* Fixed testing to use new `cgroup-bin` pkg instead of `cgroup-lite`
* Removing code no longer needed that was resulting in duplicate 'Pulling image <image_name>' messages in the cli. [#1285](https://github.com/kalabox/kalabox/issues/1285)
* Filtering out pantheon session files that aren't valid email addresses. [#1270](https://github.com/kalabox/kalabox/issues/1270)

#### App updates

* See https://github.com/kalabox/kalabox-app-pantheon/releases
* See https://github.com/kalabox/kalabox-app-php/releases
