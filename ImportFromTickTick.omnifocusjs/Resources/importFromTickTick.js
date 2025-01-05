/* OmniFocus Plug-in: Create a Task */
(() => {
    // Function to create a task with all possible parameters
    function createTask({
        title = "New Task",
        note = "",
        dueDate = null,
        deferDate = null,
        completionDate = null,
        flagged = false,
        tags = [],
        estimatedMinutes = null,
        repeating = false,  // We will handle this manually for now
        isCompleted = false, // Whether to mark the task as complete
        projectName = null
    }) {
        let project = null;

        // Find project if specified
        if (projectName) {
            project = flattenedProjects.find(p => p.name === projectName);
        }

        // If the project is not found, log a warning and create task without a project (sends it to Inbox)
        if (!project) {
            console.log(`Project "${projectName}" not found. Adding task to Inbox.`);
        }

        let task;
        if (project) {
            // Create task inside the specified project
            task = new Task(title, project);
        } else {
            // Create task without specifying a project (this places it in the inbox)
            task = new Task(title);
        }

        // Set task properties
        task.note = note;
        if (dueDate) task.dueDate = new Date(dueDate);
        if (deferDate) task.deferDate = new Date(deferDate);
        if (completionDate) task.completionDate = new Date(completionDate);
        task.flagged = flagged;
        if (estimatedMinutes) task.estimatedMinutes = estimatedMinutes;

        // Handle repeating tasks (log for now, since OmniFocus API is unclear)
        if (repeating) {
            console.log(`Repetition is not directly supported. Task "${title}" should be set as repeating manually.`);
        }

        // Add tags if provided
        tags.forEach(tagName => {
            let tag = flattenedTags.find(t => t.name === tagName);
            if (tag) {
                task.addTag(tag);
            } else {
                console.log(`Tag "${tagName}" not found.`);
            }
        });

        // Mark task as completed if specified
        if (isCompleted) {
            task.markComplete();
            console.log(`Task "${title}" was marked as completed.`);
        }

        console.log(`Created task: "${title}" in "${project ? project.name : "Inbox"}"`);
    }

    // Define the OmniFocus plug-in action
    var action = new PlugIn.Action(function(selection) {
        createTask({
            title: "Test Task",
            note: "This is a test task created by the plug-in.",
            dueDate: "2025-01-10T12:00:00Z",
            deferDate: "2025-01-08T09:00:00Z",
            flagged: true,
            estimatedMinutes: 30,
            repeating: true, // Logs a message instead of failing
            isCompleted: true, // Task will be marked as completed
            projectName: "Test 1",
            tags: ["High Priority"]
        });
    });

    // Validation function (always allows running the action)
    action.validate = function(selection) {
        return true;
    };

    // Return the action (following original script structure)
    return action;
})();