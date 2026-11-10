// Package setup embute o setup.sql no binário da API, para que ele funcione também na Vercel
// (onde a função não roda a partir da pasta api/).
package setup

import _ "embed"

//go:embed setup.sql
var SQL string
