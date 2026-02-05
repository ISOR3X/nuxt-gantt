import marimo

__generated_with = "0.19.7"
app = marimo.App(width="medium")


@app.cell
def _():
    import marimo as mo
    import polars as pl
    from pathlib import Path
    return Path, mo, pl


@app.cell
def _(Path, mo):
    file = mo.ui.file_browser(initial_path=str(Path.home() / "Downloads"), filetypes=[".xlsx"], multiple=False)
    file
    return (file,)


@app.cell
def _(file, mo, pl):
    mo.stop(not file.value)

    df = pl.read_excel(
        file.value[0].path,
        sheet_name="Project tasks",
        has_header=False
    )
    project_name = df[0, 1]
    start_date = df[2, 1].split(" ")[0]
    end_date = df[3, 1].split(" ")[0]

    df.columns = df.row(8)
    df = df.slice(9)
    return df, end_date, project_name, start_date


@app.cell
def _(df, pl):
    # Select columns we require.
    df_short = df.select(
        pl.col("Task number").alias("id"),
        pl.col("Name").alias("label"),
        pl.col("% complete").alias("progress"),
        pl.col("Start").alias("startDate"),
        pl.col("Finish").alias("endDate")
    )
    df_short
    return (df_short,)


@app.cell
def _(df_short, pl):
    # Change date format.
    df_short_date = df_short.with_columns(
        startDate=pl.col("startDate").str.split(" ").list.get(0),
        endDate=pl.col("endDate").str.split(" ").list.get(0)
    )
    df_short_date
    return (df_short_date,)


@app.cell
def _(df_short_date, end_date, project_name, start_date):
    tasks_as_json = df_short_date.to_dicts()
    tasks_as_json

    output = {
        "label": project_name,
        "startDate": start_date,
        "endDate": end_date,
        "tasks": tasks_as_json,
        "deadlines": []
    }
    output
    return (output,)


@app.cell
def _(mo, output):
    import json
    import subprocess
    import sys

    def copy_dict_to_clipboard(data: dict, indent: int = 2) -> None:
        json_text = json.dumps(data, indent=indent, ensure_ascii=False)

        if sys.platform == "darwin":  # macOS
            subprocess.run("pbcopy", input=json_text, text=True)
        elif sys.platform.startswith("linux"):
            subprocess.run("xclip -selection clipboard", input=json_text, text=True, shell=True)
        elif sys.platform == "win32":
            subprocess.run("clip", input=json_text, text=True)
        else:
            raise RuntimeError("Unsupported OS")

    mo.ui.button(on_click=lambda _: copy_dict_to_clipboard(output), label="Copy output to clipboard")
    return


if __name__ == "__main__":
    app.run()
