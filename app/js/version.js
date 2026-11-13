/* The game version shown on the title screen and in reports. Keep it equal to "version" in package.json
   (tests/system.test.js checks this). SPDX-License-Identifier: GPL-3.0-or-later */
(function (g) { (g.FW = g.FW || {}).VERSION = '0.2.0-alpha.1'; })(typeof window !== 'undefined' ? window : globalThis);
