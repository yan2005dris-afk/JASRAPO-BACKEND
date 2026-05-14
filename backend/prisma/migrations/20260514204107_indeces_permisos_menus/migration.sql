-- CreateIndex
CREATE INDEX "menus_menu_padre_id_idx" ON "menus"("menu_padre_id");

-- CreateIndex
CREATE INDEX "permisos_recurso_accion_idx" ON "permisos"("recurso", "accion");
