# Malla Interactiva – Medicina (Notegood)

Sitio estático para GitHub Pages. Permite buscar, filtrar, marcar favoritos y ver prerequisitos.

## Estructura
- `index.html` – Interfaz y componentes.
- `styles.css` – Estilos.
- `app.js` – Lógica de filtrado, render y modal.
- `data/curriculum.json` – Plan y materias. **Editá acá**.

## Publicar en GitHub Pages
1. Crear un repo nuevo, ejemplo: `malla-medicina-notegood`.
2. Subir estos archivos manteniendo la misma estructura de carpetas:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data/curriculum.json` (dentro de la carpeta `data/`)
3. En **Settings → Pages**:
   - *Source*: `Deploy from a branch`.
   - *Branch*: `main` (o `master`) y *Folder* `/root`.
   - Guardar. Esperar a que aparezca la URL.

> Si usás otra carpeta para `data/`, actualizá la ruta en `app.js` → `fetch('data/curriculum.json')`.

## Cómo editar el plan
Abrí `data/curriculum.json` y agregá/ajustá materias. Campos soportados:

```json
{
  "id": "UNICO",
  "code": "CÓDIGO VISUAL (opcional)",
  "name": "Nombre de la materia",
  "year": 1,
  "semester": 1, // 1, 2 o "A" (anual)
  "type": "obligatoria|optativa|electiva",
  "area": "Área/cátedra",
  "credits": 0,
  "hours": 0,
  "prereq": ["ID1", "ID2"],
  "correlatives": ["ID3"],
  "description": "Texto libre",
  "notes": "Texto libre"
