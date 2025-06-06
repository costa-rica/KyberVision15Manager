import { useState, useEffect } from "react";
import styles from "../../styles/admin-db/Tables.module.css";
import TemplateView from "../TemplateView";
import { useSelector } from "react-redux";
import Table02AdminDb from "../subcomponents/tables/Table02AdminDb";
import { createColumnHelper } from "@tanstack/react-table";
import ModalYesNo from "../subcomponents/modals/ModalYesNo";

export default function Tables() {
  const userReducer = useSelector((state) => state.user.value);
  const [selectedTable, setSelectedTable] = useState("User"); // Default selection
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState([]);
  const [isOpenAreYouSure, setIsOpenAreYouSure] = useState(false);
  const [modalTitleAndContent, setModalTitleAndContent] = useState({
    title: "Are you sure?",
    content: "",
  });
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRow, setSelectedRow] = useState({});

  // 1. Load visibleKeys when tableData is fetched
  useEffect(() => {
    if (tableData.length === 0) return;

    const allKeys = Object.keys(tableData[0]);
    const defaultHidden = ["createdAt", "updatedAt"];
    const visible = allKeys.filter((key) => !defaultHidden.includes(key));

    setVisibleKeys(visible);
  }, [tableData]);

  // 2. Build dynamic columns when visibleKeys change
  useEffect(() => {
    if (tableData.length === 0 || visibleKeys.length === 0) return;

    const columnHelper = createColumnHelper();
    const totalColumns = visibleKeys.length;
    const tableWidth = 60;

    const dynamicCols = visibleKeys.map((key) => {
      if (key === "id") {
        return columnHelper.accessor(key, {
          id: key,
          header: () => (
            <div style={{ width: `1rem` }} className="tdWrapAllGlobal">
              <p>{key}</p>
            </div>
          ),
          enableSorting: true,
          cell: (info) => (
            <div className={[styles.divTableCell]}>
              <button onClick={() => handleSelectRow(info.getValue())}>
                {info.getValue()}
              </button>
            </div>
          ),
        });
      } else {
        return columnHelper.accessor(key, {
          id: key,
          header: () => (
            <div
              style={{ width: `${tableWidth / totalColumns}rem` }}
              className="tdWrapAllGlobal"
            >
              <p>{key}</p>
            </div>
          ),
          enableSorting: true,
          cell: (info) => (
            <div
              style={{ width: `${tableWidth / totalColumns}rem` }}
              className={[styles.divTableCell]}
            >
              {key.startsWith("is")
                ? info.getValue()
                  ? "true"
                  : "false"
                : info.getValue()}
            </div>
          ),
        });
      }
    });

    const deleteColumn = columnHelper.display({
      id: "delete",
      header: "",
      cell: ({ row }) => (
        <div className={styles.divDeleteButton}>
          <button
            className={styles.deleteButton}
            onClick={() => {
              setSelectedId(row.original.id);
              setModalTitleAndContent({
                title: "Are you sure?",
                content: `You are about to delete ${selectedTable} ID: ${row.original.id}. \n Titled: ${row.original.title}. \n This action cannot be undone.`,
              });
              setIsOpenAreYouSure(true);
            }}
          >
            X
          </button>
        </div>
      ),
    });

    setTableColumns([...dynamicCols, deleteColumn]);
  }, [tableData, visibleKeys]);

  useEffect(() => {
    fetchData(selectedTable);
  }, [selectedTable]);

  const fetchData = async (tableName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table/${tableName}`,
        {
          headers: { Authorization: `Bearer ${userReducer.token}` },
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text(); // Log response text for debugging
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Fetched Data:", result);

      if (result.result && Array.isArray(result.data)) {
        setTableData(result.data);
        console.log("----Table Data----");
        console.log(result.data);
        console.log("-------------    ----");
        // setColumns(result.data.length > 0 ? Object.keys(result.data[0]) : []);
        // setTableData(result.data);
      } else {
        setTableData([]);
        setColumns([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setTableData([]);
      setColumns([]);
    }
  };

  // useEffect(() => {
  //   if (tableData.length === 0) return;
  //   const keys = Object.keys(tableData[0]);
  //   setVisibleKeys(keys); // 👈 initialize visible keys
  //   const columnHelper = createColumnHelper();
  //   const totalColumns = visibleKeys.length;
  //   const tableWidth = 60;

  //   const dynamicCols = visibleKeys.map((key) =>
  //     columnHelper.accessor(key, {
  //       id: key,
  //       header: () => (
  //         <div
  //           style={{ width: `${tableWidth / totalColumns}rem` }}
  //           className="tdWrapAllGlobal"
  //         >
  //           <p>{key.toUpperCase()}</p>
  //         </div>
  //       ),
  //       enableSorting: true,
  //       cell: (info) => (
  //         <div
  //           style={{ width: `${tableWidth / totalColumns}rem` }}
  //           className="tdWrapAllGlobal"
  //         >
  //           {info.getValue()}
  //         </div>
  //       ),
  //     })
  //   );
  //   // const dynamicCols = Object.keys(tableData[0]).map((key) =>
  //   //   columnHelper.accessor(key, {
  //   //     id: key,
  //   //     header: () => (
  //   //       <div
  //   //         style={{ width: `${tableWidth / totalColumns}rem` }}
  //   //         className="tdWrapAllGlobal"
  //   //       >
  //   //         <p>{key.toUpperCase()}</p>
  //   //       </div>
  //   //     ),
  //   //     enableSorting: true,
  //   //     cell: (info) => (
  //   //       <div
  //   //         style={{ width: `${tableWidth / totalColumns}rem` }}
  //   //         className="tdWrapAllGlobal"
  //   //       >
  //   //         {info.getValue()}
  //   //       </div>
  //   //     ),
  //   //   })
  //   // );

  //   setTableColumns(dynamicCols);
  // }, [tableData, visibleKeys]);

  const handleDelete = async (id) => {
    console.log("Deleting script with ID:", id);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table-row/${selectedTable}/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userReducer.token}` },
      }
    );

    if (response.status === 200) {
      alert("Script deleted successfully!");
      fetchData(selectedTable);
    } else {
      alert(`Error deleting Script: ${response.status}`);
    }
  };

  const handleSelectRow = (id) => {
    console.log("Selected row with ID:", id);
    setSelectedId(id);
    const selectedRow = tableData.find((row) => row.id === id);
    if (selectedRow) {
      const { createdAt, updatedAt, ...filteredRow } = selectedRow;
      setSelectedRow(filteredRow);
    }
  };

  const toggleKeyVisibility = (key) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleAddOrUpdateRow = async () => {
    console.log("Adding or updating row with ID:", selectedId);
    console.log("Selected row:", selectedRow);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin-db/table-row/${selectedTable}/${selectedId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${userReducer.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedRow),
      }
    );

    if (response.status === 200) {
      alert("Row added or updated successfully!");
      fetchData(selectedTable);
    } else {
      alert(`Error adding or updating row: ${response.status}`);
    }
  };

  const handleClearSelectionAndForm = () => {
    setSelectedId(null);
    setSelectedRow({});
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMain}>
          <div className={styles.divTop}>
            <h1>Admin Database</h1>
            <div className={styles.divLinks}>
              <ul>
                <li>
                  <a href="/admin-db/manage-db-backups">Manage DB Backups</a>
                </li>
                <li>
                  <a href="/admin-db/manage-db-uploads">Manage DB Uploads</a>
                </li>
                <li>
                  <a href="/admin-db/manage-db-deletes">Manage DB Deletes</a>
                </li>
              </ul>
            </div>

            <div className={styles.divControls}>
              {/* Dropdown for selecting table */}
              <div className={styles.divDropdown}>
                <div className={styles.dropdownContainer}>
                  <select
                    className={styles.dropdown}
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                  >
                    <option value="User">User</option>
                    <option value="Video">Video</option>
                    <option value="Action">Action</option>
                    <option value="CompetitionContract">
                      CompetitionContract
                    </option>
                    <option value="Complex">Complex</option>
                    <option value="GroupContract">GroupContract</option>
                    <option value="League">League</option>
                    <option value="Match">Match</option>
                    <option value="OpponentServeTimestamp">
                      OpponentServeTimestamp
                    </option>
                    <option value="Player">Player</option>
                    <option value="PlayerContract">PlayerContract</option>
                    <option value="Point">Point</option>
                    <option value="Script">Script</option>
                    <option value="SyncContract">SyncContract</option>
                    <option value="Team">Team</option>
                  </select>
                </div>
              </div>
              <div className={styles.divHideColumns}>
                {Object.keys(tableData[0] || {}).map((key) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={visibleKeys.includes(key)}
                      onChange={() => toggleKeyVisibility(key)}
                    />
                    {key}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.divMiddle}>
            <div className={styles.divAddOrUpdateGroup}>
              {visibleKeys.map((key) => (
                <div key={key} className={styles.divAddOrUpdateGroupItem}>
                  <p>{key}</p>
                  {key.startsWith("is") ? (
                    <div className={styles.divRadioGroup}>
                      <label className={styles.labelRadioOption}>
                        <input
                          type="radio"
                          name={`radio-${key}`}
                          value="true"
                          checked={selectedRow[key] === true}
                          onChange={() =>
                            setSelectedRow({ ...selectedRow, [key]: true })
                          }
                        />
                        true
                      </label>
                      <label className={styles.labelRadioOption}>
                        <input
                          type="radio"
                          name={`radio-${key}`}
                          value="false"
                          checked={selectedRow[key] === false}
                          onChange={() =>
                            setSelectedRow({ ...selectedRow, [key]: false })
                          }
                        />
                        false
                      </label>
                    </div>
                  ) : (
                    <input
                      type="text"
                      onChange={(e) =>
                        setSelectedRow({
                          ...selectedRow,
                          [key]: e.target.value,
                        })
                      }
                      // value={selectedRow[key]}
                      value={selectedRow[key] ?? ""}
                      disabled={key === "password"}
                    />
                  )}
                </div>
              ))}
              <div className={styles.divAddOrUpdateGroupItemSubmit}>
                <button onClick={handleClearSelectionAndForm}>Clear</button>
                <button onClick={handleAddOrUpdateRow}>
                  {selectedId ? "Update Row" : "Add Row"}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.divBottom}>
            <div className={styles.divTable}>
              {tableColumns && (
                <Table02AdminDb
                  columns={tableColumns}
                  data={tableData}
                  onDeleteRow={handleDelete}
                  selectedRow={handleSelectRow}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      {isOpenAreYouSure && (
        <ModalYesNo
          isModalOpenSetter={setIsOpenAreYouSure}
          title={modalTitleAndContent.title}
          // content={`You are about to delete article ID: ${selectedArticle.id}. \n Titled: ${selectedArticle.title}. \n This action cannot be undone.`}
          content={modalTitleAndContent.content}
          handleYes={() => handleDelete(selectedId)}
          handleNo={() => setIsOpenAreYouSure(false)}
        />
      )}
    </TemplateView>
  );
}
