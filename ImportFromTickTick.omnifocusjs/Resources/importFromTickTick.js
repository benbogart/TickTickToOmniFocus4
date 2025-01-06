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

    let totalRows = 0;   // Counter for total rows in CSV
    let createdTasks = 0; // Counter for successfully created tasks

    function createFolder(folderName) {
        if (!flattenedFolders.find(f => f.name === folderName)) {
            new Folder(folderName);
            console.log(`✅ Created folder: ${folderName}`);
        } else {
            console.log(`📁 Folder "${folderName}" already exists.`);
        }
    }

    function createProject({ name, parentFolder }) {
        if (parentFolder) createFolder(parentFolder);
        if (flattenedProjects.find(p => p.name === name)) {
            console.log(`📌 Project "${name}" already exists.`);
            return;
        }
        let folder = parentFolder ? flattenedFolders.find(f => f.name === parentFolder) : null;
        new Project(name, folder);
        console.log(`✅ Created project: "${name}" in "${folder ? folder.name : "Root"}"`);
    }

    function createTask(taskData) {
        console.log(`🛠 Creating task: ${JSON.stringify(taskData)}`);

        if (taskData.projectName) {
            createProject({ name: taskData.projectName, parentFolder: taskData.projectParentFolder });
        }

        let project = taskData.projectName ? flattenedProjects.find(p => p.name === taskData.projectName) : null;
        let task;

        if (project) {
            task = new Task(taskData.title, project);
        } else {
            task = new Task(taskData.title); // **No project assigned → Task goes to Inbox**
        }

        task.note = taskData.note || "";
        task.dueDate = taskData.dueDate ? parseDate(taskData.dueDate) : null;
        task.deferDate = taskData.deferDate ? parseDate(taskData.deferDate) : null;
        task.flagged = taskData.flagged || false;
        task.estimatedMinutes = taskData.estimatedMinutes || null;

        (taskData.tags || []).forEach(tagName => {
            let tag = flattenedTags.find(t => t.name === tagName);
            if (tag) task.addTag(tag);
        });

        if (taskData.completionDate) {
            task.markComplete();
            console.log(`✅ Task "${taskData.title}" was marked as completed on ${taskData.completionDate}`);
        }

        createdTasks++; // Increment counter
        console.log(`✅ Created task: "${taskData.title}" in "${project ? project.name : "Inbox"}"`);
    }

    function parseDate(dateString) {
        const match = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
        if (!match) return null;

        let [_, month, day, year] = match;
        month = parseInt(month, 10);
        day = parseInt(day, 10);
        year = parseInt(year, 10);

        if (year < 50) year += 2000;
        else if (year < 100) year += 1900;

        return new Date(year, month - 1, day);
    }

    function parseCSV(csvText) {
        let lines = csvText.split(/\r?\n/);
        let parsedRows = [];
        let insideQuotedField = false;
        let currentRow = [];

        lines = lines.slice(6); // **Skip first 6 lines (metadata/non-CSV rows)**

        for (let line of lines) {
            line = line.trim();

            if (insideQuotedField) {
                currentRow[currentRow.length - 1] += "\n" + line;
                if (line.endsWith('"')) insideQuotedField = false;
                continue;
            }

            let parsed = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(field => field.replace(/^"|"$/g, '').trim()) || [];

            if (parsed.length > 0) {
                if (parsed.some(field => field.startsWith('"') && !field.endsWith('"'))) {
                    insideQuotedField = true;
                    currentRow = parsed;
                } else {
                    parsedRows.push(parsed);
                }
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
            totalRows = rows.length - 1; // Subtract 1 for header row
            console.log("📄 CSV Headers:", rows[0]);
            console.log(`📄 CSV contains ${totalRows} rows of task data.`);
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

        console.log("🔗 Column Mappings:", columnIndices);

        let tasks = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];

            if (row.length >= headers.length) {
                let taskData = {};
                for (let key in columnIndices) {
                    let value = row[columnIndices[key]].trim();
                    if (key === "flagged") taskData[key] = value.toLowerCase() === "high";
                    else if (key === "tags") taskData[key] = value ? value.split(",").map(tag => tag.trim()) : [];
                    else if (key === "estimatedMinutes") taskData[key] = parseInt(value) * 25 || null;
                    else if (key === "completionDate") taskData[key] = parseDate(value);
                    else taskData[key] = value || null;
                }
                tasks.push(taskData);
            } else {
                console.warn(`⚠️ Skipped row ${i + 1} due to missing data:`, row);
            }
        }

        console.log(`📊 Processed ${tasks.length} tasks (from ${totalRows} rows). Creating now...`);
        tasks.forEach(createTask);

        console.log(`✅ Import completed. Created ${createdTasks} of ${totalRows} expected tasks.`);
    }

    var action = new PlugIn.Action(function(selection) {
        selectAndParseCSVFile();
    });

    action.validate = function(selection) {
        return true;
    };

    return action;
})();