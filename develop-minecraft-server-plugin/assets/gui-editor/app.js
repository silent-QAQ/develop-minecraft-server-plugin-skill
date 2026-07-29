(() => {
  "use strict";

  const VERSION = "26.2";
  const STORAGE_KEY = "mc-gui-editor-v1";
  const FAVORITES_KEY = "mc-gui-editor-favorites-v1";
  const categories = [
    ["all", "全部"], ["common", "常用"], ["building", "建筑"], ["combat", "战斗"], ["tools", "工具"],
    ["food", "食物"], ["redstone", "红石"], ["spawn", "生物"], ["misc", "其他"]
  ];

  const defaultState = () => ({
    layout: "chest54",
    title: "&8自定义界面",
    slots: {},
    selected: null
  });

  let state = loadState();
  let undoStack = [];
  let redoStack = [];
  let activeCategory = "all";
  let favorites = loadFavorites();
  let exportFormat = "yaml";
  let dragData = null;
  let formSnapshot = null;
  let saveTimer;

  const $ = (selector) => document.querySelector(selector);
  const elements = {
    itemGrid: $("#itemGrid"), itemCount: $("#itemCount"), search: $("#searchInput"),
    categoryTabs: $("#categoryTabs"), containerGrid: $("#containerGrid"),
    inventoryGrid: $("#inventoryGrid"), hotbarGrid: $("#hotbarGrid"), playerArea: $("#playerArea"),
    containerLabel: $("#containerLabel"), guiTitle: $("#guiTitle"), itemForm: $("#itemForm"),
    emptyInspector: $("#emptyInspector"), itemPreview: $("#itemPreview"),
    selectedMaterial: $("#selectedMaterial"), selectedSlot: $("#selectedSlot"),
    selectedStatus: $("#selectedStatus"), filledCount: $("#filledCount"),
    undo: $("#undoBtn"), redo: $("#redoBtn"), saveState: $("#saveState"),
    exportDialog: $("#exportDialog"), exportOutput: $("#exportOutput"), toast: $("#toast")
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && saved.slots ? { ...defaultState(), ...saved } : defaultState();
    } catch (_) {
      return defaultState();
    }
  }

  function loadFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []); }
    catch (_) { return new Set(); }
  }

  const cloneState = () => JSON.parse(JSON.stringify(state));
  const sameState = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function pushHistory(before) {
    if (sameState(before, state)) return;
    undoStack.push(before);
    if (undoStack.length > 80) undoStack.shift();
    redoStack = [];
    updateHistoryButtons();
    scheduleSave();
  }

  function mutate(change) {
    const before = cloneState();
    change();
    pushHistory(before);
    renderBoard();
    renderInspector();
  }

  function scheduleSave() {
    elements.saveState.textContent = "保存中";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      elements.saveState.textContent = "已保存";
    }, 180);
  }

  function updateHistoryButtons() {
    elements.undo.disabled = undoStack.length === 0;
    elements.redo.disabled = redoStack.length === 0;
  }

  function restore(next, destination) {
    destination.push(cloneState());
    state = next;
    elements.guiTitle.value = state.title;
    renderAll();
    scheduleSave();
  }

  function undo() { if (undoStack.length) restore(undoStack.pop(), redoStack); }
  function redo() { if (redoStack.length) restore(redoStack.pop(), undoStack); }

  function categoryOf(id) {
    if (/(spawn_egg|bucket_of_|_bucket$)/.test(id)) return "spawn";
    if (/(sword|bow|crossbow|trident|mace|shield|helmet|chestplate|leggings|boots|arrow)/.test(id)) return "combat";
    if (/(pickaxe|axe|shovel|hoe|fishing_rod|shears|brush|flint_and_steel|compass|clock)/.test(id)) return "tools";
    if (/(apple|bread|beef|porkchop|chicken|mutton|rabbit|cookie|cake|stew|soup|carrot|potato|melon|berry|berries|fish|cod|salmon|honey_bottle)/.test(id)) return "food";
    if (/(redstone|repeater|comparator|piston|observer|hopper|dispenser|dropper|lever|button|pressure_plate|tripwire|daylight_detector|rail|tnt)/.test(id)) return "redstone";
    if (/(planks|log|wood|stone|bricks|slab|stairs|wall|fence|door|trapdoor|glass|terracotta|concrete|wool|carpet|sandstone|copper|deepslate|tiles)/.test(id)) return "building";
    return "misc";
  }

  function isDefaultCommon(id) {
    return /(^|_)(stained_)?glass_pane$/.test(id) || /^(arrow|spectral_arrow|tipped_arrow)$/.test(id) ||
      /^(barrier|structure_block|item_frame|glow_item_frame|emerald|emerald_block)$/.test(id) || /_wool$/.test(id) ||
      /^(chest|ender_chest|hopper|nether_star|paper|book|player_head|clock|compass|redstone|experience_bottle)$/.test(id);
  }

  function isCommon(id) { return isDefaultCommon(id) || favorites.has(id); }

  function createIcon(id, alt = "") {
    const img = document.createElement("img");
    img.alt = alt;
    img.draggable = false;
    const mapped = window.MC_ICON_MAP?.[id];
    if (mapped) img.src = mapped;
    img.addEventListener("error", () => {
      img.style.display = "none";
      const letter = document.createElement("span");
      letter.className = "fallback-letter";
      letter.textContent = id === "air" ? "∅" : id.slice(0, 2).toUpperCase();
      if (!img.parentElement?.querySelector(".fallback-letter")) img.parentElement?.append(letter);
    });
    if (!mapped) queueMicrotask(() => img.dispatchEvent(new Event("error")));
    return img;
  }

  function renderCategories() {
    elements.categoryTabs.replaceChildren(...categories.map(([id, label]) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.className = id === activeCategory ? "active" : "";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(id === activeCategory));
      button.addEventListener("click", () => { activeCategory = id; renderCategories(); renderLibrary(); });
      return button;
    }));
  }

  function renderLibrary() {
    const query = elements.search.value.trim().toLowerCase().replace(/^minecraft:/, "");
    const all = Array.isArray(window.MC_ITEMS) ? window.MC_ITEMS : [];
    const filtered = all.filter(id => (!query || id.includes(query)) &&
      (activeCategory === "all" || (activeCategory === "common" ? isCommon(id) : categoryOf(id) === activeCategory)));
    elements.itemCount.textContent = filtered.length > 240 ? `${filtered.length} / 240` : String(filtered.length);
    const fragment = document.createDocumentFragment();
    filtered.slice(0, 240).forEach(id => {
      const tile = document.createElement("button");
      const builtInCommon = isDefaultCommon(id);
      tile.className = "item-tile";
      tile.classList.toggle("favorite", favorites.has(id));
      tile.title = builtInCommon ? `minecraft:${id} · 内置常用物品` : `minecraft:${id} · 右键${favorites.has(id) ? "取消收藏" : "加入常用"}`;
      tile.draggable = true;
      tile.append(createIcon(id, id));
      if (favorites.has(id)) {
        const mark = document.createElement("span"); mark.className = "favorite-mark"; mark.textContent = "★"; tile.append(mark);
      }
      tile.addEventListener("dragstart", event => {
        dragData = { type: "material", material: id };
        event.dataTransfer.setData("text/plain", `material:${id}`);
        event.dataTransfer.effectAllowed = "copy";
      });
      tile.addEventListener("click", () => placeMaterial(id));
      tile.addEventListener("contextmenu", event => {
        event.preventDefault();
        if (builtInCommon) { showToast(`${id} 是内置常用物品`); return; }
        if (favorites.has(id)) { favorites.delete(id); showToast(`已取消收藏 ${id}`); }
        else { favorites.add(id); showToast(`已加入常用 ${id}`); }
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites].sort()));
        renderLibrary();
      });
      fragment.append(tile);
    });
    elements.itemGrid.replaceChildren(fragment);
  }

  function activeSlotKeys() {
    const result = [];
    const containerSize = state.layout === "chest54" ? 54 : 27;
    for (let i = 0; i < containerSize; i++) result.push(`container:${i}`);
    for (let i = 0; i < 27; i++) result.push(`inventory:${i}`);
    for (let i = 0; i < 9; i++) result.push(`hotbar:${i}`);
    return result;
  }

  function newItem(material) {
    return { material, name: "", amount: 1, customModelData: "", role: "", note: "", lore: "", glint: false, unbreakable: false, enchantments: "", attributes: "", nbt: "" };
  }

  function placeMaterial(material) {
    let target = state.selected;
    const active = activeSlotKeys();
    if (!target || !active.includes(target)) target = active.find(key => !state.slots[key]);
    if (!target) { showToast("当前布局没有空槽位"); return; }
    mutate(() => { state.slots[target] = newItem(material); state.selected = target; });
  }

  function parseDrag(event) {
    if (dragData) return dragData;
    const raw = event.dataTransfer.getData("text/plain");
    if (raw.startsWith("material:")) return { type: "material", material: raw.slice(9) };
    if (raw.startsWith("slot:")) return { type: "slot", key: raw.slice(5) };
    return null;
  }

  function createSlot(key, index) {
    const button = document.createElement("button");
    const item = state.slots[key];
    button.className = `slot${state.selected === key ? " selected" : ""}${item ? " has-item" : ""}${item?.glint ? " glint" : ""}`;
    button.type = "button";
    button.dataset.key = key;
    button.title = item ? `minecraft:${item.material}${item.role ? ` · ${item.role}` : ""}` : `空槽位 ${key}`;
    const indexNode = document.createElement("span");
    indexNode.className = "slot-index";
    indexNode.textContent = index;
    button.append(indexNode);
    if (item) {
      button.append(createIcon(item.material, item.material));
      if (+item.amount > 1) {
        const amount = document.createElement("span"); amount.className = "amount"; amount.textContent = item.amount; button.append(amount);
      }
      button.draggable = true;
      button.addEventListener("dragstart", event => {
        dragData = { type: "slot", key };
        event.dataTransfer.setData("text/plain", `slot:${key}`);
        event.dataTransfer.effectAllowed = "move";
      });
    }
    button.addEventListener("dragend", () => { dragData = null; });
    button.addEventListener("dragover", event => { event.preventDefault(); button.classList.add("drop-target"); });
    button.addEventListener("dragleave", () => button.classList.remove("drop-target"));
    button.addEventListener("drop", event => {
      event.preventDefault(); button.classList.remove("drop-target");
      const data = parseDrag(event); dragData = null;
      if (!data) return;
      mutate(() => {
        if (data.type === "material") state.slots[key] = newItem(data.material);
        if (data.type === "slot" && state.slots[data.key]) {
          const displaced = state.slots[key];
          state.slots[key] = state.slots[data.key];
          if (displaced) state.slots[data.key] = displaced; else delete state.slots[data.key];
        }
        state.selected = key;
      });
    });
    button.addEventListener("click", () => { state.selected = key; renderBoard(); renderInspector(); });
    return button;
  }

  function fillGrid(grid, prefix, count) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) fragment.append(createSlot(`${prefix}:${i}`, i));
    grid.replaceChildren(fragment);
  }

  function renderBoard() {
    const player = state.layout === "player";
    fillGrid(elements.containerGrid, "container", player ? 27 : 54);
    elements.playerArea.classList.remove("hidden");
    fillGrid(elements.inventoryGrid, "inventory", 27);
    fillGrid(elements.hotbarGrid, "hotbar", 9);
    elements.containerLabel.textContent = player ? "箱子 · 27 槽" : "大型箱子 · 54 槽";
    document.querySelectorAll("[data-layout]").forEach(button => button.classList.toggle("active", button.dataset.layout === state.layout));
    const active = activeSlotKeys();
    elements.filledCount.textContent = active.filter(key => state.slots[key]).length;
    elements.selectedStatus.textContent = state.selected ? `已选择 ${slotLabel(state.selected)}` : "未选择槽位";
    updateHistoryButtons();
  }

  function slotLabel(key) {
    if (!key) return "";
    const [area, index] = key.split(":");
    return `${{ container: "容器", inventory: "背包", hotbar: "物品栏" }[area]} #${index}`;
  }

  function renderInspector() {
    const item = state.selected ? state.slots[state.selected] : null;
    elements.emptyInspector.classList.toggle("hidden", !!item);
    elements.itemForm.classList.toggle("hidden", !item);
    if (!item) return;
    elements.selectedMaterial.textContent = `minecraft:${item.material}`;
    elements.selectedSlot.textContent = slotLabel(state.selected);
    elements.itemPreview.replaceChildren(createIcon(item.material, item.material));
    [...elements.itemForm.elements].forEach(control => {
      if (!control.name) return;
      if (control.type === "checkbox") control.checked = !!item[control.name];
      else control.value = item[control.name] ?? "";
    });
  }

  function renderAll() { renderCategories(); renderLibrary(); renderBoard(); renderInspector(); refreshIcons(); }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
  }

  function yamlString(value) {
    return `"${String(value ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }

  function jsonValue(raw) {
    if (!raw || !raw.trim()) return undefined;
    try { return JSON.parse(raw); } catch (_) { return raw; }
  }

  function exportObject() {
    const slots = {};
    activeSlotKeys().forEach(key => {
      const item = state.slots[key];
      if (!item) return;
      slots[key] = {
        材质: `minecraft:${item.material}`, 数量: +item.amount || 1,
        名称: item.name || undefined, 作用: item.role || undefined, 开发备注: item.note || undefined,
        描述: item.lore ? item.lore.split(/\r?\n/) : undefined,
        附魔光效: item.glint || undefined, 不可破坏: item.unbreakable || undefined,
        自定义模型数据: item.customModelData === "" ? undefined : +item.customModelData,
        附魔: item.enchantments ? item.enchantments.split(/\r?\n/) : undefined,
        属性: jsonValue(item.attributes), NBT_PDC: jsonValue(item.nbt)
      };
      Object.keys(slots[key]).forEach(field => slots[key][field] === undefined && delete slots[key][field]);
    });
    return { 配置版本: 1, Minecraft版本: VERSION, 界面标题: state.title, 布局类型: state.layout === "chest54" ? "6x9箱子+3x9背包+9物品栏" : "3x9箱子+3x9背包+9物品栏", 槽位: slots };
  }

  function toYaml(data) {
    const lines = ["# 由 Minecraft GUI 配置台生成，可直接提交给 AI 辅助开发", "配置版本: 1", `Minecraft版本: ${yamlString(data.Minecraft版本)}`, `界面标题: ${yamlString(data.界面标题)}`, `布局类型: ${yamlString(data.布局类型)}`, "槽位:"];
    Object.entries(data.槽位).forEach(([key, item]) => {
      lines.push(`  ${yamlString(key)}:`);
      Object.entries(item).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          lines.push(`    ${field}:`); value.forEach(entry => lines.push(`      - ${yamlString(entry)}`));
        } else if (value && typeof value === "object") {
          lines.push(`    ${field}: ${yamlString(JSON.stringify(value))}`);
        } else if (typeof value === "boolean" || typeof value === "number") {
          lines.push(`    ${field}: ${value}`);
        } else if (field === "开发备注" && String(value).includes("\n")) {
          lines.push(`    ${field}: |-`); String(value).split(/\r?\n/).forEach(line => lines.push(`      ${line}`));
        } else lines.push(`    ${field}: ${yamlString(value)}`);
      });
    });
    if (!Object.keys(data.槽位).length) lines.push("  {}");
    return lines.join("\n");
  }

  function outputFor(format) {
    const data = exportObject();
    if (format === "json") return JSON.stringify(data, null, 2);
    const yaml = toYaml(data);
    if (format === "prompt") return [
      "请使用 $develop-minecraft-server-plugin 根据下面的 GUI 设计辅助开发 Minecraft 插件。",
      "请先将槽位作用和开发备注转换为功能及验收标准，再制定计划；不要仅生成静态菜单。",
      "目标版本与依赖若未明确，请结合项目现状判断。配置优先使用带中文说明的 YAML。",
      "", "```yaml", yaml, "```"
    ].join("\n");
    return yaml;
  }

  function updateExport() { elements.exportOutput.value = outputFor(exportFormat); }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    setTimeout(() => elements.toast.classList.remove("show"), 1600);
  }

  function bindEvents() {
    elements.search.addEventListener("input", renderLibrary);
    document.querySelectorAll("[data-layout]").forEach(button => button.addEventListener("click", () => {
      if (button.dataset.layout === state.layout) return;
      mutate(() => { state.layout = button.dataset.layout; state.selected = null; });
    }));
    elements.guiTitle.addEventListener("focus", () => { formSnapshot = cloneState(); });
    elements.guiTitle.addEventListener("input", event => { state.title = event.target.value; scheduleSave(); });
    elements.guiTitle.addEventListener("change", () => { if (formSnapshot) pushHistory(formSnapshot); formSnapshot = null; });
    elements.itemForm.addEventListener("focusin", () => { if (!formSnapshot) formSnapshot = cloneState(); });
    elements.itemForm.addEventListener("input", event => {
      if (!event.target.name || !state.selected || !state.slots[state.selected]) return;
      state.slots[state.selected][event.target.name] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      renderBoard(); scheduleSave();
    });
    elements.itemForm.addEventListener("focusout", event => {
      if (event.relatedTarget && elements.itemForm.contains(event.relatedTarget)) return;
      if (formSnapshot) pushHistory(formSnapshot); formSnapshot = null;
    });
    $("#removeItemBtn").addEventListener("click", () => { if (state.selected) mutate(() => delete state.slots[state.selected]); });
    elements.undo.addEventListener("click", undo);
    elements.redo.addEventListener("click", redo);
    $("#clearBtn").addEventListener("click", () => {
      if (!Object.keys(state.slots).length || !confirm("清空当前编辑器中的全部槽位配置？")) return;
      mutate(() => { state.slots = {}; state.selected = null; });
    });
    document.addEventListener("keydown", event => {
      if ((event.key === "Delete" || event.key === "Backspace") && state.selected && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
        event.preventDefault(); mutate(() => delete state.slots[state.selected]);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); }
    });
    $("#exportBtn").addEventListener("click", () => { updateExport(); elements.exportDialog.showModal(); refreshIcons(); });
    $("#closeExportBtn").addEventListener("click", () => elements.exportDialog.close());
    $("#exportFormat").addEventListener("click", event => {
      const button = event.target.closest("button[data-format]"); if (!button) return;
      exportFormat = button.dataset.format;
      document.querySelectorAll("[data-format]").forEach(item => item.classList.toggle("active", item === button)); updateExport();
    });
    $("#copyBtn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(elements.exportOutput.value); showToast("已复制导出内容"); }
      catch (_) { elements.exportOutput.select(); document.execCommand("copy"); showToast("已复制导出内容"); }
    });
    $("#downloadBtn").addEventListener("click", () => {
      const extension = exportFormat === "yaml" ? "yml" : exportFormat === "json" ? "json" : "md";
      const blob = new Blob([elements.exportOutput.value], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `minecraft-gui-config.${extension}`; link.click(); URL.revokeObjectURL(link.href);
    });
  }

  elements.guiTitle.value = state.title;
  bindEvents();
  renderAll();
  updateHistoryButtons();
})();
