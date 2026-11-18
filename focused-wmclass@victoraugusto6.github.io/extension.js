import Gio from 'gi://Gio';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const IFACE = `
<node>
  <interface name="io.github.victoraugusto6.FocusedWmClass">
    <method name="Get">
      <arg type="s" direction="out" name="wmClass"/>
    </method>
  </interface>
</node>`;

class FocusedWmClassService {
    Get() {
        return global.display.focus_window?.get_wm_class() ?? '';
    }
}

export default class FocusedWmClassExtension extends Extension {
    enable() {
        this._dbus = Gio.DBusExportedObject.wrapJSObject(IFACE, new FocusedWmClassService());
        this._dbus.export(Gio.DBus.session, '/io/github/victoraugusto6/FocusedWmClass');
    }

    disable() {
        this._dbus.unexport();
        this._dbus = null;
    }
}
