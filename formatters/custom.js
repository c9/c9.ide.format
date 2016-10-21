define(function(require, exports, module) {
    main.consumes = [
        "Plugin", "settings", "preferences", "save", "collab", "tabManager", "dialog.error"
    ];
    main.provides = ["format.custom"];
    return main;

    function main(options, imports, register) {
        var settings = imports.settings;
        var prefs = imports.preferences;
        var tabs = imports.tabManager;
        var collab = imports.collab;
        var showError = imports["dialog.error"].show;
        var Plugin = imports.Plugin;
        var plugin = new Plugin("Ajax.org", main.consumes);
        
        function load() {
            collab.on("beforeSave", beforeSave, plugin);
        }
        
        function beforeSave(e) {
            var tab = tabs.findTab(e.docId);
            if (!tab || !tab.editor || !tab.editor.ace)
                return;
            var mode = tab.editor.ace.session.syntax;
            var enabled = settings.getBool("project/format/@" + mode + "_enabled");
            if (!enabled)
                return;
            var formatter = settings.get("project/format/@" + mode + "_formatter");
            if (!formatter)
                return showError("No code formatter set for " + mode + ": please check your project settings");
            e.postProcessor = {
                command: "bash",
                args: ["-c", formatter]
            };
        }
        
        plugin.on("load", function() {
            load();
        });
        plugin.on("unload", function() {
            
        });
        
        /**
         * Custom code formatter extension
         *
         * Reformats code in the current document on save
         */
        plugin.freezePublicAPI({});
        
        register(null, {
            "format.custom": plugin
        });
    }
});