# OmniFocus CSV Importer

### A plug-in to import tasks from TickTick (or other task managers) into OmniFocus 4

## 📌 Purpose

This **OmniFocus 4 plug-in** allows users to **import tasks, projects, and folders** from a CSV file into OmniFocus. It is designed to seamlessly transfer tasks from **TickTick** and other task managers while **preserving metadata such as due dates, tags, priorities, and completion status**.

This tool ensures:

- ✅ **Accurate project and folder creation** (avoids duplicates)
- ✅ **Full support for task properties** (due dates, notes, tags, etc.)
- ✅ **Correct handling of completed tasks**
- ✅ **Proper CSV parsing**, including **multiline fields and quoted values**

---

## 📥 Installation

### Step 1: Install the Plug-In

1. \*\*Download the the repository.
2. **Double-click the ImportFromTickTick.omnifocusjs file** to install it into **OmniFocus 4**.
3. OmniFocus will prompt you to **confirm the installation**. Click **Install**.

---

## 🚀 Usage

### Step 1: Export Your Tasks from TickTick

- **You must use the TickTick web interface** to export a backup.
- Go to **TickTick Web** → **Settings** → **Backup**.
- Save the file somewhere accessible (e.g., your **Downloads** folder).

### Step 2: Run the Import Plug-In in OmniFocus

1. Open **OmniFocus 4**.
2. Go to **Automation → Import from TickTick**.
3. Click **Run**.

### Step 3: Select the TickTick CSV File

1. A file picker will open.
2. Choose the **CSV file you exported from TickTick**.

### Step 4: Tasks Are Imported! 🎉

- ✅ **Folders and projects will be created if they don’t already exist.**
- ✅ **Tasks will be assigned to the correct projects and folders.**
- ✅ **Completed tasks will be marked as completed in OmniFocus.**
- ✅ **All metadata (tags, due dates, priorities) will be preserved.**

---

## 📄 CSV Format

The **TickTick CSV file** must have the following columns:

| **CSV Column**       | **Mapped to OmniFocus** |
| -------------------- | ----------------------- |
| `Title`              | Task Title              |
| `Content`            | Task Note               |
| `Due Date`           | Due Date                |
| `Start Date`         | Defer Date              |
| `Completed Time`     | Completion Date         |
| `Priority`           | Flagged (Yes/No)        |
| `Tags`               | Tags (comma-separated)  |
| `Estimated Pomodoro` | Estimated Minutes       |
| `List Name`          | Project Name            |
| `Folder Name`        | Parent Folder           |

- ✅ **Multiline task notes** are fully supported.
- ✅ **Dates must be in ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`) or MM/DD/YYYY format.**
- ✅ **Tags must be comma-separated (`Work, Important, Review`).**

---

## ⚙️ Configuration & Customization

- **Modify the CSV column mapping** in the script if your CSV format differs.
- **Supports task importing from multiple sources** (TickTick, Todoist, Notion, etc.).
- **Automatically prevents duplicate projects & folders**.

---

## 🔧 Troubleshooting

### Common Issues & Fixes

| Issue                                 | Cause                           | Fix                                                                  |
| ------------------------------------- | ------------------------------- | -------------------------------------------------------------------- |
| ✅ **Some tasks are missing**         | Required fields missing (Title) | Ensure all tasks have a title                                        |
| ✅ **Completion dates are incorrect** | Date format issues              | Ensure `Completed Time` is in `YYYY-MM-DDTHH:MM:SSZ` or `MM/DD/YYYY` |
| ✅ **Tasks are in the wrong project** | Folder/project mismatch         | Verify project names in CSV                                          |
| ✅ **Too many projects are created**  | CSV format issue                | Check for trailing spaces in project names                           |

---

## 📜 License

This plug-in is **open-source** and available under the **MIT License**.

---

## 👨‍💻 Contributors

- **Benjamin Bogart**
- **ChatGPT (Technical Implementation & Debugging Support)**

---

🚀 **Now you can seamlessly import your TickTick tasks into OmniFocus 4! Let me know if you need any last refinements.** 😊
