/* OmniFocus Plug-in: Create Multiple Tasks */
(() => {

    // Function to ensure a folder exists
    function createFolder(folderName) {
        if (!flattenedFolders.find(f => f.name === folderName)) {
            new Folder(folderName);
            console.log(`Created folder: ${folderName}`);
        } else {
            console.log(`Folder "${folderName}" already exists.`);
        }
    }

    // Function to ensure a project exists before creating a new one
    function createProject({
        name = "New Project",
        parentFolder = null,
        note = "",
        dueDate = null,
        deferDate = null,
        completionDate = null,
        flagged = false,
        tags = [],
        estimatedMinutes = null,
        type = "parallel",
        status = "active"
    }) {
        // Ensure the folder exists if specified
        if (parentFolder) {
            createFolder(parentFolder);
        }

        // Check if the project already exists
        let existingProject = flattenedProjects.find(p => p.name === name);
        if (existingProject) {
            console.log(`Project "${name}" already exists. Skipping creation.`);
            return;
        }

        // Find folder if specified
        let folder = parentFolder ? flattenedFolders.find(f => f.name === parentFolder) : null;

        // Create the project inside the folder if available, otherwise at the root level
        let project = folder ? new Project(name, folder) : new Project(name);

        // Set project properties
        project.note = note;
        if (dueDate) project.dueDate = new Date(dueDate);
        if (deferDate) project.deferDate = new Date(deferDate);
        if (completionDate) project.completionDate = new Date(completionDate);
        project.flagged = flagged;
        if (estimatedMinutes) project.estimatedMinutes = estimatedMinutes;

        // Set project type (Parallel or Sequential)
        project.sequential = type.toLowerCase() === "sequential";

        // Handle project status
        switch (status.toLowerCase()) {
            case "on-hold":
                project.status = Project.Status.OnHold;
                break;
            case "completed":
                project.status = Project.Status.Completed;
                break;
            case "dropped":
                project.status = Project.Status.Dropped;
                break;
            default:
                project.status = Project.Status.Active;
        }

        // Add tags if provided
        tags.forEach(tagName => {
            let tag = flattenedTags.find(t => t.name === tagName);
            if (tag) {
                project.addTag(tag);
            } else {
                console.log(`Tag "${tagName}" not found.`);
            }
        });

        console.log(`Created ${type} project: "${name}" in "${folder ? folder.name : "Root"}"`);
    }

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
        repeating = false,
        isCompleted = false,
        projectName = null,
        projectParentFolder = null
    }) {
        // Ensure the project exists if specified
        if (projectName) {
            createProject({
                name: projectName,
                parentFolder: projectParentFolder
            });
        }

        let project = null;

        // Find project if specified
        if (projectName) {
            project = flattenedProjects.find(p => p.name === projectName);
        }

        // If project is not found, log a warning and create task without a project (sends it to Inbox)
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

    // Function to create multiple tasks from a list
    function createMultipleTasks(taskList) {
        taskList.forEach(taskData => {
            createTask(taskData);
        });
    }

    // Define the OmniFocus plug-in action
    var action = new PlugIn.Action(function(selection) {
        // Sample list of tasks
        let tasks = [
            {
                title: "Task 1",
                note: "First sample task",
                dueDate: "2025-01-10T12:00:00Z",
                flagged: true,
                estimatedMinutes: 15,
                projectName: "Project A",
                projectParentFolder: "Work",
                tags: ["Urgent"]
            },
            {
                title: "Task 2",
                note: "Second sample task",
                dueDate: "2025-01-15T14:00:00Z",
                estimatedMinutes: 30,
                projectName: "Project A",
                projectParentFolder: "Work",
                tags: ["Low Priority"]
            },
            {
                title: "Task 3",
                note: "Third sample task",
                deferDate: "2025-01-20T08:00:00Z",
                flagged: false,
                estimatedMinutes: 45,
                projectName: "Project B",
                projectParentFolder: "Personal",
                tags: ["Review"]
            }
        ];

        // Run the task iterator
        createMultipleTasks(tasks);
    });

    // Validation function (always allows running the action)
    action.validate = function(selection) {
        return true;
    };

    // Return the action (following original script structure)
    return action;
})();