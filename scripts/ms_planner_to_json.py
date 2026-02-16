# /// script
# dependencies = [
#   "polars",
#   "fastexcel"
# ]
# ///

import argparse
import json
import sys
import polars as pl

"""
Usage (requires [uv](https://docs.astral.sh/uv/)):
    `uv run scripts/ms_planner_to_json.py --file <EXCEL_FILE>`
    
    By default it prints to the terminal. Use `--clipboard` to copy to clipboard or `... > output.json` to write to a file.
"""


def copy_dict_to_clipboard(data: dict, indent: int = 2) -> None:
    """Copy dictionary to clipboard as formatted JSON."""
    json_text = json.dumps(data, indent=indent, ensure_ascii=False)

    # Source - https://stackoverflow.com/a/4203897
    # Posted by atomizer, modified by community. See post 'Timeline' for change history
    # Retrieved 2026-02-16, License - CC BY-SA 4.0
    from tkinter import Tk

    r = Tk()
    r.withdraw()
    r.clipboard_clear()
    r.clipboard_append(json_text)
    r.update()  # now it stays on the clipboard after the window is closed
    r.destroy()


def convert_excel_to_json(file_path: str) -> dict:
    df = pl.read_excel(file_path, sheet_name="Project tasks", has_header=False)

    # Extract project metadata
    project_name = df[0, 1]
    start_date = df[2, 1].split(" ")[0]
    end_date = df[3, 1].split(" ")[0]

    df.columns = df.row(8)
    df = df.slice(9)

    # Select and rename columns
    df_short = df.select(
        pl.col("Task number").alias("id"),
        pl.col("Name").alias("label"),
        pl.col("% complete").alias("progress"),
        pl.col("Start").alias("startDate"),
        pl.col("Finish").alias("endDate"),
        pl.col("Notes").alias("description"),
        pl.col("Depends on").alias("dependencies"),
    )

    # Format dates and progress
    df_short_date = df_short.with_columns(
        startDate=pl.col("startDate").str.split(" ").list.get(0),
        endDate=pl.col("endDate").str.split(" ").list.get(0),
        progress=pl.col("progress").cast(pl.Float32),
    )

    # Convert dependencies to list
    df_list_deps = df_short_date.with_columns(
        dependencies=pl.when(pl.col("dependencies").str.len_chars() > 0).then(pl.col("dependencies").str.split(", ")).otherwise(None)
    )

    tasks_as_json = df_list_deps.to_dicts()

    # Round progress values
    tasks_as_json = [
        {
            **t,
            "progress": round(t["progress"], 2) if t.get("progress") is not None else None,
        }
        for t in tasks_as_json
    ]

    output = {
        "label": project_name,
        "startDate": start_date,
        "endDate": end_date,
        "tasks": tasks_as_json,
        "deadlines": [],
    }

    return output


def main():
    parser = argparse.ArgumentParser(description="Convert Microsoft Planner Excel export to JSON format")
    parser.add_argument("--file", required=True, help="Path to the Excel file to convert")
    parser.add_argument("--clipboard", action="store_true", help="Copy output to clipboard instead of printing to terminal")

    args = parser.parse_args()

    try:
        output = convert_excel_to_json(args.file)

        if args.clipboard:
            copy_dict_to_clipboard(output, indent=2)
            print("Output copied to clipboard", file=sys.stderr)
        else:
            print(json.dumps(output, indent=2, ensure_ascii=True))

    except FileNotFoundError:
        print(f"Error: File '{args.file}' not found", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
