/* OmniFocus Plug-in: Create Two Test Folders */
(() => {
    // Function to create or find a folder
    function getOrCreateFolder(folderName) {
        let folder = flattenedFolders.find(f => f.name === folderName);
        if (!folder) {
            folder = new Folder(folderName);
            console.log(`Created new folder: ${folderName}`);
        } else {
            console.log(`Folder already exists: ${folderName}`);
        }
        return folder;
    }

    // Define the OmniFocus plug-in action
    var action = new PlugIn.Action(function(selection) {
        getOrCreateFolder("Test 1");
        getOrCreateFolder("Test 2");
    });

    // Validation function (always allows running the action)
    action.validate = function(selection) {
        return true;
    };

    // Return the action (following original script structure)
    return action;
})();