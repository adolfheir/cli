export default {
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 120,
  "proseWrap": "never",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": ".prettierrc",
      "options": {
        "parser": "json"
      }
    },
    {
      "files": "document.ejs",
      "options": {
        "parser": "html"
      }
    }
  ],
  "importOrder": [
    "^react$",
    "dayjs",
    "lodash",
    "loglevel",
    "classnames",
    "^react",
    "@arco-design/web-react",
    "<THIRD_PARTY_MODULES>",
    "^@public/(.*)$",
    "^@app/(.*)$",
    "^@assets/(.*)$",
    "^@model/(.*)$",
    "^@constants/(.*)$",
    "^@common/(.*)$",
    "^@components/(.*)$",
    "^@materia/(.*)$",
    "^@utils/(.*)$",
    "^@hooks/(.*)$",
    "^@pages/(.*)$",
    "^[./]"
  ]
}
