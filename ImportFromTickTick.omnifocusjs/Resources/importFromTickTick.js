/* OmniFocus Plug-in: Read CSV and Create Tasks */
(() => {

    const mappedColumns = {
        "Title": "title",
        "Content": "note",
        "Due Date": "dueDate",
        "Start Date": "deferDate",
        "Completed Time": "completionDate",
        "Priority": "flagged",
        "Tags": "tags",
        "Estimated Pomodoro": "estimatedMinutes",
        "List Name": "projectName",
        "Folder Name": "projectParentFolder"
    };

    let totalRows = 0;   
    let createdTasks = 0; 
    let skippedTasks = 0; 

    function createFolder(folderName) {
        if (!flattenedFolders.find(f => f.name === folderName)) {
            new Folder(folderName);
            console.log(`✅ Created folder: ${folderName}`);
        }
    }
    
    function createProject({ name, parentFolder }) {
        if (parentFolder) createFolder(parentFolder);
        if (!flattenedProjects.find(p => p.name === name)) {
            let folder = parentFolder ? flattenedFolders.find(f => f.name === parentFolder) : null;
            new Project(name, folder);
            console.log(`✅ Created project: "${name}" in "${folder ? folder.name : "Root"}"`);
        }
    }

    function createTask(taskData) {
        if (!taskData.title) {
            skippedTasks++;
            return;
        }
    
        // **If the project is "Inbox", remove it so the task lands in the Inbox**
        if (taskData.projectName && taskData.projectName.toLowerCase() === "inbox") {
            taskData.projectName = null;
        }
    
        // **Ensure the project exists (if specified)**
        if (taskData.projectName) {
            createProject({ name: taskData.projectName, parentFolder: taskData.projectParentFolder });
        }
    
        // **Find the project after ensuring it exists**
        let project = taskData.projectName ? flattenedProjects.find(p => p.name === taskData.projectName) : null;
    
        // **Create the task in the project if specified, otherwise in the Inbox**
        let task = project ? new Task(taskData.title, project) : new Task(taskData.title);
    
        task.note = taskData.note || "";
        task.dueDate = taskData.dueDate ? parseDate(taskData.dueDate) : null;
        task.deferDate = taskData.deferDate ? parseDate(taskData.deferDate) : null;
        task.flagged = taskData.flagged || false;
        task.estimatedMinutes = taskData.estimatedMinutes || null;
    
        (taskData.tags || []).forEach(tagName => {
            let tag = flattenedTags.find(t => t.name === tagName);
            if (tag) task.addTag(tag);
        });
    
        // ✅ **Fix: Ensure completed tasks are properly marked as complete**
        if (taskData.isCompleted) {
            task.markComplete();  // ✅ Call without arguments to use current date
            console.log(`✅ Task "${taskData.title}" was marked as completed.`);
        }
    
        createdTasks++;
    }


    function parseDate(dateString) {
        if (!dateString) return null;
    
        // ✅ Handle ISO 8601 timestamps (e.g., "2025-01-04T18:54:41+0000")
        let isoDate = Date.parse(dateString);
        if (!isNaN(isoDate)) {
            return new Date(isoDate);
        }
    
        // ✅ Handle MM/DD/YY or MM/DD/YYYY formats
        const match = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        if (match) {
            let [_, month, day, year] = match;
            month = parseInt(month, 10);
            day = parseInt(day, 10);
            year = parseInt(year, 10);
            if (year < 50) year += 2000;
            else if (year < 100) year += 1900;
            return new Date(year, month - 1, day);
        }
    
        console.warn(`⚠️ Unrecognized date format: "${dateString}"`);
        return null; // Return null if no valid date is parsed
    }

    function parseCSV(csvText) {
        let lines = csvText.split(/\r?\n/);
        let parsedRows = [];
        let currentRow = [];
        let insideQuotes = false;
        let fieldBuffer = "";
    
        lines = lines.slice(6); // **Skip first 6 lines (metadata/non-CSV rows)**
    
        for (let line of lines) {
            let chars = [...line];
            for (let i = 0; i < chars.length; i++) {
                let char = chars[i];
    
                if (char === '"') {
                    // **If we encounter a quote, toggle insideQuotes mode**
                    insideQuotes = !insideQuotes;
                } else if (char === ',' && !insideQuotes) {
                    // **If we encounter a comma outside of quotes, treat it as a field separator**
                    currentRow.push(fieldBuffer.trim());
                    fieldBuffer = "";
                } else {
                    // **Otherwise, add the character to the current field**
                    fieldBuffer += char;
                }
            }
    
            // **If the line ended and we’re still inside quotes, it's a multiline field**
            if (insideQuotes) {
                fieldBuffer += "\n"; // Keep the newline for proper formatting
            } else {
                currentRow.push(fieldBuffer.trim()); // Add last field in the row
                parsedRows.push(currentRow);
                currentRow = [];
                fieldBuffer = "";
            }
        }
    
        return parsedRows;
    }
    
    async function selectAndParseCSVFile() {
        try {
            let filePicker = new FilePicker();
            filePicker.folders = false;
            filePicker.multiple = false;
            filePicker.types = [new FileType("public.comma-separated-values-text")];

            let urls = await filePicker.show();
            if (urls.length === 0) {
                console.log("🚫 No file selected.");
                return;
            }

            let fileWrapper = await FileWrapper.fromURL(urls[0], [FileWrapper.ReadingOptions.Immediate]);
            let fileContents = fileWrapper.contents.toString();

            if (!fileContents) {
                console.error("❌ Failed to read file contents.");
                return;
            }

            let rows = parseCSV(fileContents);
            totalRows = rows.length - 1;
            parseCSVAndCreateTasks(rows);

        } catch (error) {
            console.error("❌ Error opening file:", error);
        }
    }

    function parseCSVAndCreateTasks(rows) {
        const headers = rows[0];
        const columnIndices = {};
        headers.forEach((header, index) => {
            if (mappedColumns[header]) columnIndices[mappedColumns[header]] = index;
        });
    
        let tasks = [];
    
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
    
            let taskData = {};
            for (let key in columnIndices) {
                let value = row[columnIndices[key]]?.trim() || "";
                if (key === "flagged") taskData[key] = value.toLowerCase() === "high";
                else if (key === "tags") taskData[key] = value ? value.split(",").map(tag => tag.trim()) : [];
                else if (key === "estimatedMinutes") taskData[key] = parseInt(value) * 25 || null;
                else if (key === "completionDate") {
                    taskData[key] = parseDate(value);
                    taskData.isCompleted = taskData[key] !== null; // ✅ Set isCompleted correctly
                    console.log(`completionData: ${value}, parsed date: ${taskData[key]}, isCompleted: ${taskData.isCompleted}`)
                }
                else taskData[key] = value || null;
            }
            tasks.push(taskData);
        }
    
        tasks.forEach(createTask);
    
        console.log(`✅ Import completed. Created ${createdTasks} of ${totalRows} expected tasks. Skipped ${skippedTasks} rows due to missing title.`);
    }

    var action = new PlugIn.Action(function(selection) {
        selectAndParseCSVFile();
    });

    action.validate = function(selection) {
        return true;
    };

    return action;
})();