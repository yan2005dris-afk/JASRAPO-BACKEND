# Report PDF goldens

The HTML files in `html/` are review artifacts, not an automatic visual
approval. Each dual-style family keeps independent `legacy` and `modern`
goldens; Payment Agreement keeps one canonical `unique` golden.

Update them only after reviewing the rendered PDF for the affected family:

```powershell
$env:UPDATE_PDF_GOLDENS='1'
.\node_modules\.bin\jest.cmd src/reports/pdf/report-html-golden.spec.ts --runInBand
Remove-Item Env:UPDATE_PDF_GOLDENS
```

The pull request must explain why the golden changed and identify the person
who reviewed the corresponding PDF. Never accept a golden update only because
the snapshot command produced new output.
