(() => {
  "use strict";

  const VERSION = "26.2";
  const SCHEMA_VERSION = 2;
  const STORAGE_KEY = "mc-gui-editor-v1";
  const FAVORITES_KEY = "mc-gui-editor-favorites-v1";
  const TOOLBAR_KEY = "mc-gui-editor-toolbar-collapsed";
  const ITEM_FIELDS = ["material", "name", "amount", "customModelData", "role", "note", "lore", "glint", "unbreakable", "enchantments", "attributes", "nbt"];
  const categories = [
    ["all", "全部"], ["common", "常用"], ["building", "建筑"], ["combat", "战斗"], ["tools", "工具"],
    ["food", "食物"], ["redstone", "红石"], ["spawn", "生物"], ["misc", "其他"]
  ];
  const triggerTypes = [
    ["gui_open", "GUI 打开"],
    ["after_previous", "上一状态完成"],
    ["state_reached", "指定槽位进入状态"],
    ["slot_click", "点击指定槽位"],
    ["item_placed", "槽位放入物品"],
    ["item_removed", "槽位取出物品"],
    ["slot_matches", "槽位物品匹配"],
    ["inventory_contains", "玩家背包含物品"],
    ["permission", "玩家拥有权限"],
    ["placeholder", "变量比较成立"],
    ["player_stat", "玩家属性比较"],
    ["economy", "玩家余额比较"],
    ["game_mode", "玩家游戏模式"],
    ["world", "玩家所在世界"],
    ["world_time", "世界时间范围"],
    ["weather", "当前天气"],
    ["command", "执行命令"],
    ["custom_event", "插件事件"],
    ["random_chance", "随机概率命中"],
    ["group_complete", "动态槽组完成"]
  ];
  const operators = [
    ["==", "等于"], ["!=", "不等于"], [">=", "大于等于"], ["<=", "小于等于"], [">", "大于"], ["<", "小于"], ["contains", "包含"]
  ];
  const simulatedTriggerTypes = new Set([
    "permission", "placeholder", "player_stat", "economy", "game_mode",
    "world", "world_time", "weather", "command", "custom_event"
  ]);

  const $ = selector => document.querySelector(selector);
  const deepClone = value => JSON.parse(JSON.stringify(value));
  const uid = prefix => prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  const clampInteger = (value, minimum, fallback) => {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) ? Math.max(minimum, number) : fallback;
  };
  const normalizeMaterialId = value => String(value || "air").trim().toLowerCase().replace(/^minecraft:/, "") || "air";
  const exportMaterialId = value => {
    const material = normalizeMaterialId(value);
    return material.includes(":") ? material : "minecraft:" + material;
  };

  function newItem(material) {
    return {
      material: normalizeMaterialId(material),
      name: "",
      amount: 1,
      customModelData: "",
      role: "",
      note: "",
      lore: "",
      glint: false,
      unbreakable: false,
      enchantments: "",
      attributes: "",
      nbt: "",
      dynamicStates: []
    };
  }

  function snapshotItem(item) {
    const source = item || newItem("air");
    const defaults = newItem("air");
    const result = {};
    ITEM_FIELDS.forEach(field => {
      result[field] = source[field] !== undefined ? deepClone(source[field]) : defaults[field];
    });
    result.material = normalizeMaterialId(result.material);
    result.amount = clampInteger(result.amount, 1, 1);
    result.glint = !!result.glint;
    result.unbreakable = !!result.unbreakable;
    return result;
  }

  function defaultTrigger(type) {
    const trigger = {
      type: type || "gui_open",
      targetSlot: "",
      material: "",
      amount: 1,
      operator: ">=",
      value: "",
      attribute: "level",
      permission: "",
      placeholder: "",
      world: "",
      timeMin: 0,
      timeMax: 24000,
      weather: "clear",
      command: "",
      event: "",
      chance: 50,
      groupId: "",
      stateIndex: 0
    };
    if (trigger.type === "game_mode") trigger.value = "survival";
    return trigger;
  }

  function normalizeTrigger(raw, fallbackType) {
    const source = raw && typeof raw === "object" ? raw : {};
    const type = triggerTypes.some(entry => entry[0] === source.type) ? source.type : (fallbackType || "gui_open");
    return { ...defaultTrigger(type), ...source, type };
  }

  function normalizeDynamicState(entry, index) {
    const source = entry && typeof entry === "object" ? entry : {};
    return {
      id: source.id || uid("state"),
      label: source.label || "状态 " + (index + 1),
      item: snapshotItem(source.item || source),
      trigger: normalizeTrigger(source.trigger, "after_previous"),
      delayMin: clampInteger(source.delayMin, 0, 0),
      delayMax: clampInteger(source.delayMax, 0, 0)
    };
  }

  function normalizeItem(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const item = { ...newItem(source.material || "air"), ...source };
    item.material = normalizeMaterialId(item.material);
    item.amount = clampInteger(item.amount, 1, 1);
    item.glint = !!item.glint;
    item.unbreakable = !!item.unbreakable;
    const dynamicStates = Array.isArray(source.dynamicStates) ? source.dynamicStates : [];
    item.dynamicStates = dynamicStates.map(normalizeDynamicState);
    return item;
  }

  function normalizeDynamicGroup(raw, index) {
    const source = raw && typeof raw === "object" ? raw : {};
    const type = source.type === "random" ? "random" : "path";
    return {
      id: source.id || uid("motion"),
      type,
      name: source.name || (type === "path" ? "轨迹槽 " : "随机槽 ") + (index + 1),
      slots: Array.isArray(source.slots) ? [...new Set(source.slots.filter(key => typeof key === "string"))] : [],
      trigger: normalizeTrigger(source.trigger, "gui_open"),
      delayMin: clampInteger(source.delayMin, 0, 0),
      delayMax: clampInteger(source.delayMax, 0, 0),
      intervalMin: clampInteger(source.intervalMin, 1, 10),
      intervalMax: clampInteger(source.intervalMax, 1, 10),
      loop: source.loop !== false
    };
  }

  const defaultState = () => ({
    schemaVersion: SCHEMA_VERSION,
    layout: "chest54",
    title: "&8自定义界面",
    slots: {},
    containerSlots: [],
    dynamicGroups: [],
    selected: null
  });

  function normalizeState(raw) {
    const source = raw && typeof raw === "object" ? raw : {};
    const result = { ...defaultState(), ...source, schemaVersion: SCHEMA_VERSION };
    result.slots = {};
    Object.entries(source.slots || {}).forEach(([key, item]) => {
      if (item && typeof item === "object") result.slots[key] = normalizeItem(item);
    });
    result.containerSlots = Array.isArray(source.containerSlots) ? [...new Set(source.containerSlots.filter(key => typeof key === "string"))] : [];
    result.dynamicGroups = Array.isArray(source.dynamicGroups) ? source.dynamicGroups.map(normalizeDynamicGroup) : [];
    return result;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && saved.slots ? normalizeState(saved) : defaultState();
    } catch (_) {
      return defaultState();
    }
  }

  function loadFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []); }
    catch (_) { return new Set(); }
  }

  let state = loadState();
  let undoStack = [];
  let redoStack = [];
  let activeCategory = "all";
  let favorites = loadFavorites();
  let exportFormat = "yaml";
  let dragData = null;
  let formSnapshot = null;
  let saveTimer;
  let multiSelection = [];
  let contextSlot = null;
  let stateEditor = null;
  let dynamicEditor = null;
  let previewRuntime = null;
  let ctrlPressed = false;

  const elements = {
    itemGrid: $("#itemGrid"), itemCount: $("#itemCount"), search: $("#searchInput"),
    categoryTabs: $("#categoryTabs"), containerGrid: $("#containerGrid"),
    inventoryGrid: $("#inventoryGrid"), hotbarGrid: $("#hotbarGrid"), playerArea: $("#playerArea"),
    containerLabel: $("#containerLabel"), guiTitle: $("#guiTitle"), itemForm: $("#itemForm"),
    emptyInspector: $("#emptyInspector"), itemPreview: $("#itemPreview"),
    selectedMaterial: $("#selectedMaterial"), selectedSlot: $("#selectedSlot"),
    selectedStatus: $("#selectedStatus"), filledCount: $("#filledCount"),
    undo: $("#undoBtn"), redo: $("#redoBtn"), saveState: $("#saveState"),
    exportDialog: $("#exportDialog"), exportOutput: $("#exportOutput"), toast: $("#toast"),
    dynamicToolbar: $("#dynamicToolbar"), multiSelectStatus: $("#multiSelectStatus"),
    dynamicGroupList: $("#dynamicGroupList"), previewButton: $("#previewBtn"),
    previewIndicator: $("#previewIndicator"), stateDialog: $("#stateDialog"),
    stateList: $("#stateList"), stateForm: $("#stateForm"), stateTriggerSection: $("#stateTriggerSection"),
    dynamicDialog: $("#dynamicDialog"), dynamicForm: $("#dynamicForm"), contextMenu: $("#slotContextMenu")
  };

  const cloneState = () => deepClone(state);
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
    if (previewRuntime) return;
    const before = cloneState();
    change();
    state = normalizeState(state);
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
    elements.undo.disabled = !!previewRuntime || undoStack.length === 0;
    elements.redo.disabled = !!previewRuntime || redoStack.length === 0;
  }

  function restore(next, destination) {
    if (previewRuntime) return;
    destination.push(cloneState());
    state = normalizeState(next);
    multiSelection = multiSelection.filter(key => activeSlotKeys().includes(key));
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

  function createIcon(id, alt) {
    const material = normalizeMaterialId(id);
    const lookup = material.replace(/^minecraft:/, "");
    const img = document.createElement("img");
    img.alt = alt || "";
    img.draggable = false;
    const mapped = window.MC_ICON_MAP && window.MC_ICON_MAP[lookup];
    if (mapped) img.src = mapped;
    img.addEventListener("error", () => {
      img.style.display = "none";
      const letter = document.createElement("span");
      letter.className = "fallback-letter";
      letter.textContent = lookup === "air" ? "∅" : lookup.slice(0, 2).toUpperCase();
      if (img.parentElement && !img.parentElement.querySelector(".fallback-letter")) img.parentElement.append(letter);
    });
    if (!mapped) queueMicrotask(() => img.dispatchEvent(new Event("error")));
    return img;
  }

  function createLucide(name) {
    const icon = document.createElement("i");
    icon.dataset.lucide = name;
    return icon;
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
    elements.itemCount.textContent = filtered.length > 240 ? filtered.length + " / 240" : String(filtered.length);
    const fragment = document.createDocumentFragment();
    filtered.slice(0, 240).forEach(id => {
      const tile = document.createElement("button");
      const builtInCommon = isDefaultCommon(id);
      tile.className = "item-tile";
      tile.classList.toggle("favorite", favorites.has(id));
      tile.classList.toggle("preview-held", !!previewRuntime && previewRuntime.heldItem && previewRuntime.heldItem.material === id);
      tile.title = builtInCommon ? "minecraft:" + id + " · 内置常用物品" : "minecraft:" + id + " · 右键" + (favorites.has(id) ? "取消收藏" : "加入常用");
      tile.draggable = true;
      tile.append(createIcon(id, id));
      if (favorites.has(id)) {
        const mark = document.createElement("span");
        mark.className = "favorite-mark";
        mark.textContent = "★";
        tile.append(mark);
      }
      tile.addEventListener("dragstart", event => {
        dragData = { type: "material", material: id };
        event.dataTransfer.setData("text/plain", "material:" + id);
        event.dataTransfer.effectAllowed = "copy";
      });
      tile.addEventListener("click", () => placeMaterial(id));
      tile.addEventListener("contextmenu", event => {
        event.preventDefault();
        if (previewRuntime) return;
        if (builtInCommon) { showToast(id + " 是内置常用物品"); return; }
        if (favorites.has(id)) { favorites.delete(id); showToast("已取消收藏 " + id); }
        else { favorites.add(id); showToast("已加入常用 " + id); }
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
    for (let i = 0; i < containerSize; i++) result.push("container:" + i);
    for (let i = 0; i < 27; i++) result.push("inventory:" + i);
    for (let i = 0; i < 9; i++) result.push("hotbar:" + i);
    return result;
  }

  function slotLabel(key) {
    if (!key) return "";
    const parts = key.split(":");
    const names = { container: "容器", inventory: "背包", hotbar: "物品栏" };
    return (names[parts[0]] || parts[0]) + " #" + parts[1];
  }

  function motionConflict(slots, ignoredGroupIndex) {
    for (const key of slots) {
      if (state.containerSlots.includes(key)) return slotLabel(key) + " 已是容器槽";
      if (state.slots[key] && state.slots[key].dynamicStates.length) return slotLabel(key) + " 已配置动态状态";
      const groupIndex = state.dynamicGroups.findIndex((group, index) => index !== ignoredGroupIndex && group.slots.includes(key));
      if (groupIndex >= 0) return slotLabel(key) + " 已属于“" + state.dynamicGroups[groupIndex].name + "”";
    }
    return "";
  }

  function configurationConflict() {
    for (let index = 0; index < state.dynamicGroups.length; index++) {
      const conflict = motionConflict(state.dynamicGroups[index].slots, index);
      if (conflict) return conflict;
    }
    return "";
  }

  function hasSimulatedTriggers() {
    if (state.dynamicGroups.some(group => simulatedTriggerTypes.has(group.trigger.type))) return true;
    return Object.values(state.slots).some(item => item.dynamicStates.some(entry => simulatedTriggerTypes.has(entry.trigger.type)));
  }

  function placeMaterial(material) {
    if (previewRuntime) {
      previewRuntime.heldItem = snapshotItem(newItem(material));
      renderLibrary();
      showToast("已拿起 minecraft:" + material);
      return;
    }
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

  function appendFlag(container, text, className, title) {
    const flag = document.createElement("span");
    flag.className = "slot-flag " + className;
    flag.textContent = text;
    flag.title = title;
    container.append(flag);
  }

  function appendSlotFlags(button, key, baseItem) {
    const flags = document.createElement("span");
    flags.className = "slot-flags";
    if (state.containerSlots.includes(key)) appendFlag(flags, "C", "container", "容器槽");
    const groups = state.dynamicGroups.filter(group => group.slots.includes(key));
    if (groups.some(group => group.type === "path")) appendFlag(flags, "T", "path", "动态轨迹槽");
    if (groups.some(group => group.type === "random")) appendFlag(flags, "R", "random", "动态随机槽");
    if (baseItem && baseItem.dynamicStates.length) appendFlag(flags, String(baseItem.dynamicStates.length + 1), "state", "动态状态");
    if (flags.childElementCount) button.append(flags);
  }

  function previewItemAt(key) {
    if (!previewRuntime) return state.slots[key] || null;
    return Object.prototype.hasOwnProperty.call(previewRuntime.items, key) ? previewRuntime.items[key] : null;
  }

  function createSlot(key, index) {
    const button = document.createElement("button");
    const baseItem = state.slots[key] || null;
    const item = previewItemAt(key);
    const selectionIndex = multiSelection.indexOf(key);
    button.className = "slot";
    button.classList.toggle("selected", !previewRuntime && state.selected === key && selectionIndex < 0);
    button.classList.toggle("multi-selected", !previewRuntime && selectionIndex >= 0);
    button.classList.toggle("has-item", !!item);
    button.classList.toggle("glint", !!item && !!item.glint);
    button.classList.toggle("container-slot", state.containerSlots.includes(key));
    button.classList.toggle("state-changing", !!previewRuntime && previewRuntime.recentChanges.has(key));
    button.classList.toggle("motion-active", !!previewRuntime && Object.values(previewRuntime.motionCursors).includes(key));
    button.type = "button";
    button.dataset.key = key;
    const stateCount = baseItem ? baseItem.dynamicStates.length + 1 : 0;
    button.title = item ? exportMaterialId(item.material) + (baseItem && baseItem.role ? " · " + baseItem.role : "") +
      (stateCount > 1 ? " · " + stateCount + " 个状态" : "") : "空槽位 " + key;
    const slotTraits = [];
    if (state.containerSlots.includes(key)) slotTraits.push("容器槽");
    if (state.dynamicGroups.some(group => group.type === "path" && group.slots.includes(key))) slotTraits.push("轨迹槽");
    if (state.dynamicGroups.some(group => group.type === "random" && group.slots.includes(key))) slotTraits.push("随机槽");
    if (slotTraits.length) button.title += " · " + slotTraits.join(" / ");
    const indexNode = document.createElement("span");
    indexNode.className = "slot-index";
    indexNode.textContent = index;
    button.append(indexNode);
    if (item) {
      button.append(createIcon(item.material, item.material));
      if (+item.amount > 1) {
        const amount = document.createElement("span");
        amount.className = "amount";
        amount.textContent = item.amount;
        button.append(amount);
      }
      if (!previewRuntime) {
        button.draggable = true;
        button.addEventListener("dragstart", event => {
          if (ctrlPressed || event.ctrlKey || event.metaKey) { event.preventDefault(); return; }
          dragData = { type: "slot", key };
          event.dataTransfer.setData("text/plain", "slot:" + key);
          event.dataTransfer.effectAllowed = "move";
        });
      }
    }
    if (!previewRuntime && selectionIndex >= 0) {
      const order = document.createElement("span");
      order.className = "selection-order";
      order.textContent = selectionIndex + 1;
      button.append(order);
    }
    appendSlotFlags(button, key, baseItem);
    button.addEventListener("dragend", () => { dragData = null; });
    button.addEventListener("dragover", event => {
      event.preventDefault();
      if (!previewRuntime || state.containerSlots.includes(key)) button.classList.add("drop-target");
    });
    button.addEventListener("dragleave", () => button.classList.remove("drop-target"));
    button.addEventListener("drop", event => {
      event.preventDefault();
      button.classList.remove("drop-target");
      const data = parseDrag(event);
      dragData = null;
      if (!data) return;
      if (previewRuntime) { handlePreviewDrop(key, data); return; }
      if (data.type === "slot" && state.slots[data.key]) {
        const movingItem = state.slots[data.key];
        const displacedItem = state.slots[key];
        const destinationGroup = state.dynamicGroups.find(group => group.slots.includes(key));
        const sourceGroup = state.dynamicGroups.find(group => group.slots.includes(data.key));
        if (destinationGroup && movingItem.dynamicStates.length) {
          showToast(slotLabel(key) + " 属于“" + destinationGroup.name + "”，不能放入动态状态物品");
          return;
        }
        if (sourceGroup && displacedItem && displacedItem.dynamicStates.length) {
          showToast(slotLabel(data.key) + " 属于“" + sourceGroup.name + "”，不能换入动态状态物品");
          return;
        }
      }
      mutate(() => {
        if (data.type === "material") state.slots[key] = newItem(data.material);
        if (data.type === "slot" && state.slots[data.key]) {
          const displaced = state.slots[key];
          state.slots[key] = state.slots[data.key];
          if (displaced) state.slots[data.key] = displaced;
          else delete state.slots[data.key];
        }
        state.selected = key;
      });
    });
    button.addEventListener("click", event => {
      if (previewRuntime) { handlePreviewSlotClick(key); return; }
      if (event.ctrlKey || event.metaKey) {
        const found = multiSelection.indexOf(key);
        if (found >= 0) multiSelection.splice(found, 1);
        else multiSelection.push(key);
      } else {
        multiSelection = [];
      }
      state.selected = key;
      renderBoard();
      renderInspector();
    });
    button.addEventListener("contextmenu", event => {
      event.preventDefault();
      if (previewRuntime) { handlePreviewContext(key); return; }
      showSlotContextMenu(key, event.clientX, event.clientY);
    });
    return button;
  }

  function fillGrid(grid, prefix, count) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) fragment.append(createSlot(prefix + ":" + i, i));
    grid.replaceChildren(fragment);
  }

  function renderBoard() {
    const player = state.layout === "player";
    fillGrid(elements.containerGrid, "container", player ? 27 : 54);
    elements.playerArea.classList.remove("hidden");
    fillGrid(elements.inventoryGrid, "inventory", 27);
    fillGrid(elements.hotbarGrid, "hotbar", 9);
    elements.containerLabel.textContent = player ? "箱子 · 27 槽" : "大型箱子 · 54 槽";
    document.querySelectorAll("[data-layout]").forEach(button => {
      button.classList.toggle("active", button.dataset.layout === state.layout);
      button.disabled = !!previewRuntime;
    });
    const active = activeSlotKeys();
    elements.filledCount.textContent = active.filter(key => state.slots[key] || state.containerSlots.includes(key)).length;
    elements.guiTitle.value = state.title;
    elements.guiTitle.disabled = !!previewRuntime;
    $("#clearBtn").disabled = !!previewRuntime;
    if (previewRuntime) elements.selectedStatus.textContent = previewRuntime.heldItem ? "手持 " + exportMaterialId(previewRuntime.heldItem.material) : "预览模式";
    else if (multiSelection.length) elements.selectedStatus.textContent = "已按顺序选择 " + multiSelection.length + " 个槽位";
    else elements.selectedStatus.textContent = state.selected ? "已选择 " + slotLabel(state.selected) : "未选择槽位";
    renderToolbar();
    updateHistoryButtons();
  }

  function renderInspector() {
    const item = state.selected ? state.slots[state.selected] : null;
    elements.emptyInspector.classList.toggle("hidden", !!item);
    elements.itemForm.classList.toggle("hidden", !item);
    if (!item) return;
    elements.selectedMaterial.textContent = exportMaterialId(item.material);
    const suffix = item.dynamicStates.length ? " · " + (item.dynamicStates.length + 1) + " 个状态" : "";
    elements.selectedSlot.textContent = slotLabel(state.selected) + suffix;
    elements.itemPreview.replaceChildren(createIcon(item.material, item.material));
    [...elements.itemForm.elements].forEach(control => {
      if (control.name) {
        if (control.type === "checkbox") control.checked = !!item[control.name];
        else control.value = item[control.name] === undefined ? "" : item[control.name];
      }
      control.disabled = !!previewRuntime;
    });
    $("#editStatesBtn").disabled = !!previewRuntime;
    $("#removeItemBtn").disabled = !!previewRuntime;
  }

  function renderAll() { renderCategories(); renderLibrary(); renderBoard(); renderInspector(); refreshIcons(); }
  function refreshIcons() { if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } }); }

  function renderToolbar() {
    const count = multiSelection.length;
    elements.multiSelectStatus.textContent = previewRuntime ? "预览运行中" : (count ? "已选择 " + count + " 个槽位" : "未选择槽位");
    $("#clearSelectionBtn").disabled = !!previewRuntime || count === 0;
    $("#createPathBtn").disabled = !!previewRuntime || count < 2;
    $("#createRandomBtn").disabled = !!previewRuntime || count < 2;
    $("#setContainerBtn").disabled = !!previewRuntime || !multiSelection.some(key => key.startsWith("container:"));
    const simulateButton = $("#simulateConditionBtn");
    const canSimulate = !!previewRuntime && hasSimulatedTriggers();
    simulateButton.classList.toggle("hidden", !canSimulate);
    simulateButton.disabled = !canSimulate;
    elements.previewButton.classList.toggle("active", !!previewRuntime);
    elements.previewButton.querySelector("span").textContent = previewRuntime ? "停止" : "预览";
    const previewIcon = elements.previewButton.querySelector("svg, i");
    if (previewIcon && previewIcon.tagName.toLowerCase() === "i") previewIcon.dataset.lucide = previewRuntime ? "square" : "play";
    if (previewIcon && previewIcon.tagName.toLowerCase() === "svg") previewIcon.replaceWith(createLucide(previewRuntime ? "square" : "play"));
    elements.previewIndicator.classList.toggle("hidden", !previewRuntime);
    document.body.classList.toggle("preview-mode", !!previewRuntime);
    const fragment = document.createDocumentFragment();
    state.dynamicGroups.forEach((group, index) => {
      const button = document.createElement("button");
      button.className = "dynamic-group-item";
      button.type = "button";
      button.disabled = !!previewRuntime;
      button.title = "编辑 " + group.name;
      button.append(createLucide(group.type === "path" ? "move-right" : "shuffle"));
      const name = document.createElement("span");
      name.textContent = group.name;
      const countNode = document.createElement("b");
      countNode.textContent = group.slots.length + " 槽";
      button.append(name, countNode);
      button.addEventListener("click", () => openDynamicEditor(group.type, index));
      fragment.append(button);
    });
    elements.dynamicGroupList.replaceChildren(fragment);
    queueMicrotask(refreshIcons);
  }

  function showSlotContextMenu(key, x, y) {
    contextSlot = key;
    const isContainerArea = key.startsWith("container:");
    const isContainer = state.containerSlots.includes(key);
    const containerAction = elements.contextMenu.querySelector("[data-context-action=container]");
    containerAction.disabled = !isContainerArea;
    containerAction.querySelector("span").textContent = isContainer ? "取消容器槽" : "设为容器槽";
    const removeAction = elements.contextMenu.querySelector("[data-context-action=remove]");
    removeAction.disabled = !state.slots[key];
    elements.contextMenu.querySelector(".context-separator").classList.toggle("hidden", removeAction.disabled);
    elements.contextMenu.classList.remove("hidden");
    const rect = elements.contextMenu.getBoundingClientRect();
    elements.contextMenu.style.left = Math.max(6, Math.min(x, window.innerWidth - rect.width - 6)) + "px";
    elements.contextMenu.style.top = Math.max(6, Math.min(y, window.innerHeight - rect.height - 6)) + "px";
  }

  function hideContextMenu() { elements.contextMenu.classList.add("hidden"); contextSlot = null; }

  function triggerLabel(type) {
    const match = triggerTypes.find(entry => entry[0] === type);
    return match ? match[1] : type;
  }

  function slotOptions(emptyLabel) {
    return [{ value: "", label: emptyLabel }].concat(activeSlotKeys().map(key => ({ value: key, label: slotLabel(key) })));
  }

  function conditionFieldSpecs(type, context) {
    const currentLabel = context && context.currentSlot ? "当前槽位" : "任意槽位";
    const slotField = { key: "targetSlot", label: "目标槽位", type: "select", options: slotOptions(currentLabel) };
    const materialField = { key: "material", label: "物品 ID", placeholder: "apple", list: "materialOptions" };
    const operatorField = { key: "operator", label: "比较方式", type: "select", options: operators.map(entry => ({ value: entry[0], label: entry[1] })) };
    switch (type) {
      case "state_reached":
        return [slotField, { key: "stateIndex", label: "状态编号", type: "number", min: 0 }];
      case "slot_click":
      case "item_removed":
        return [slotField];
      case "item_placed":
        return [slotField, materialField];
      case "slot_matches":
        return [slotField, materialField, { key: "amount", label: "最少数量", type: "number", min: 1 }];
      case "inventory_contains":
        return [materialField, { key: "amount", label: "最少数量", type: "number", min: 1 }];
      case "permission":
        return [{ key: "permission", label: "权限节点", placeholder: "plugin.gui.use", wide: true }];
      case "placeholder":
        return [
          { key: "placeholder", label: "变量", placeholder: "%player_level%" },
          operatorField,
          { key: "value", label: "比较值", placeholder: "10", wide: true }
        ];
      case "player_stat":
        return [
          { key: "attribute", label: "玩家属性", type: "select", options: [
            { value: "level", label: "等级" }, { value: "health", label: "生命值" }, { value: "food", label: "饥饿值" }, { value: "experience", label: "经验值" }
          ] },
          operatorField,
          { key: "value", label: "比较值", type: "number", min: 0, wide: true }
        ];
      case "economy":
        return [operatorField, { key: "value", label: "余额", type: "number", min: 0 }];
      case "game_mode":
        return [{ key: "value", label: "游戏模式", type: "select", options: [
          { value: "survival", label: "生存" }, { value: "creative", label: "创造" }, { value: "adventure", label: "冒险" }, { value: "spectator", label: "旁观" }
        ], wide: true }];
      case "world":
        return [{ key: "world", label: "世界名称", placeholder: "world", wide: true }];
      case "world_time":
        return [{ key: "timeMin", label: "起始时间", type: "number", min: 0 }, { key: "timeMax", label: "结束时间", type: "number", min: 0 }];
      case "weather":
        return [{ key: "weather", label: "天气", type: "select", options: [
          { value: "clear", label: "晴朗" }, { value: "rain", label: "下雨" }, { value: "thunder", label: "雷暴" }
        ], wide: true }];
      case "command":
        return [{ key: "command", label: "命令", placeholder: "/shop", wide: true }];
      case "custom_event":
        return [{ key: "event", label: "事件标识", placeholder: "quest.completed", wide: true }];
      case "random_chance":
        return [{ key: "chance", label: "命中概率 (%)", type: "number", min: 0, max: 100, wide: true }];
      case "group_complete":
        return [{ key: "groupId", label: "动态槽组", type: "select", options: [
          { value: "", label: "任意动态槽组" },
          ...state.dynamicGroups.filter(group => !context || group.id !== context.groupId).map(group => ({ value: group.id, label: group.name }))
        ], wide: true }];
      default:
        return [];
    }
  }

  function renderConditionEditor(root, trigger, update, context) {
    const typeSelect = root.querySelector("[data-condition-field=type]");
    const availableTypes = context && context.kind === "group" ? triggerTypes.filter(entry => entry[0] !== "after_previous") : triggerTypes;
    typeSelect.replaceChildren(...availableTypes.map(entry => {
      const option = document.createElement("option");
      option.value = entry[0];
      option.textContent = entry[1];
      return option;
    }));
    typeSelect.value = trigger.type;
    typeSelect.onchange = () => {
      const next = defaultTrigger(typeSelect.value);
      update(next);
      renderConditionEditor(root, next, update, context);
    };
    const params = root.querySelector("[data-condition-params]");
    const fragment = document.createDocumentFragment();
    conditionFieldSpecs(trigger.type, context).forEach(spec => {
      const label = document.createElement("label");
      if (spec.wide) label.className = "wide";
      label.textContent = spec.label;
      let control;
      if (spec.type === "select") {
        control = document.createElement("select");
        (spec.options || []).forEach(entry => {
          const option = document.createElement("option");
          option.value = entry.value;
          option.textContent = entry.label;
          control.append(option);
        });
      } else {
        control = document.createElement("input");
        control.type = spec.type || "text";
        if (spec.placeholder) control.placeholder = spec.placeholder;
        if (spec.min !== undefined) control.min = spec.min;
        if (spec.max !== undefined) control.max = spec.max;
        if (spec.list) control.setAttribute("list", spec.list);
      }
      control.dataset.triggerParam = spec.key;
      control.value = trigger[spec.key] === undefined ? "" : trigger[spec.key];
      label.append(control);
      fragment.append(label);
    });
    params.replaceChildren(fragment);
    const updateParam = event => {
      const control = event.target.closest("[data-trigger-param]");
      if (!control) return;
      trigger[control.dataset.triggerParam] = control.type === "number" ? Number(control.value) : control.value;
      update(trigger);
    };
    params.oninput = updateParam;
    params.onchange = updateParam;
  }

  function formatTrigger(trigger) {
    let result = triggerLabel(trigger.type);
    if (trigger.targetSlot) result += " · " + slotLabel(trigger.targetSlot);
    if (trigger.type === "random_chance") result += " · " + trigger.chance + "%";
    return result;
  }

  function stateItemAt(draft, index) { return index === 0 ? draft : draft.dynamicStates[index - 1].item; }

  function setDialogError(dialog, message) {
    const error = dialog.querySelector("[data-dialog-error]");
    error.textContent = message || "";
    error.classList.toggle("hidden", !message);
    if (message) error.scrollIntoView({ block: "nearest" });
  }

  function openStateEditor(key) {
    const draft = normalizeItem(state.slots[key] || newItem("air"));
    stateEditor = { key, draft: deepClone(draft), activeIndex: 0 };
    setDialogError(elements.stateDialog, "");
    $("#stateDialogTitle").textContent = slotLabel(key) + " · 动态状态";
    renderStateDialog();
    elements.stateDialog.showModal();
    refreshIcons();
  }

  function renderStateDialog() {
    if (!stateEditor) return;
    renderStateList();
    renderStateForm();
  }

  function renderStateList() {
    const total = stateEditor.draft.dynamicStates.length + 1;
    const fragment = document.createDocumentFragment();
    for (let index = 0; index < total; index++) {
      const item = stateItemAt(stateEditor.draft, index);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "state-list-item";
      button.classList.toggle("active", index === stateEditor.activeIndex);
      const icon = document.createElement("span");
      icon.className = "state-list-icon";
      icon.append(createIcon(item.material, item.material));
      const copy = document.createElement("span");
      copy.className = "state-list-copy";
      const name = document.createElement("strong");
      name.textContent = index === 0 ? "状态 0 · 初始" : "状态 " + index;
      const detail = document.createElement("span");
      detail.textContent = index === 0 ? exportMaterialId(item.material) : formatTrigger(stateEditor.draft.dynamicStates[index - 1].trigger);
      copy.append(name, detail);
      button.append(icon, copy);
      button.addEventListener("click", () => { stateEditor.activeIndex = index; renderStateDialog(); });
      fragment.append(button);
    }
    elements.stateList.replaceChildren(fragment);
  }

  function renderStateForm() {
    const index = stateEditor.activeIndex;
    const item = stateItemAt(stateEditor.draft, index);
    ["material", "name", "amount", "lore", "glint"].forEach(field => {
      const control = elements.stateForm.elements[field];
      if (control.type === "checkbox") control.checked = !!item[field];
      else control.value = item[field] === undefined ? "" : item[field];
    });
    $("#stateIndexLabel").textContent = index === 0 ? "初始状态" : "状态 " + index;
    $("#deleteStateBtn").disabled = index === 0;
    elements.stateTriggerSection.classList.toggle("hidden", index === 0);
    if (index > 0) {
      const entry = stateEditor.draft.dynamicStates[index - 1];
      elements.stateForm.elements.delayMin.value = entry.delayMin;
      elements.stateForm.elements.delayMax.value = entry.delayMax;
      renderConditionEditor(
        elements.stateTriggerSection.querySelector("[data-condition-editor]"),
        entry.trigger,
        next => { entry.trigger = next; },
        { currentSlot: stateEditor.key, kind: "state" }
      );
    }
  }

  function addDynamicState() {
    if (!stateEditor) return;
    const previous = snapshotItem(stateItemAt(stateEditor.draft, stateEditor.draft.dynamicStates.length));
    stateEditor.draft.dynamicStates.push({
      id: uid("state"),
      label: "状态 " + (stateEditor.draft.dynamicStates.length + 1),
      item: previous,
      trigger: defaultTrigger("after_previous"),
      delayMin: 0,
      delayMax: 0
    });
    stateEditor.activeIndex = stateEditor.draft.dynamicStates.length;
    renderStateDialog();
  }

  function deleteDynamicState() {
    if (!stateEditor || stateEditor.activeIndex === 0) return;
    stateEditor.draft.dynamicStates.splice(stateEditor.activeIndex - 1, 1);
    stateEditor.activeIndex = Math.max(0, stateEditor.activeIndex - 1);
    renderStateDialog();
  }

  function validateTickRange(source, minField, maxField, minimum) {
    source[minField] = clampInteger(source[minField], minimum, minimum);
    source[maxField] = clampInteger(source[maxField], minimum, source[minField]);
    if (source[maxField] < source[minField]) {
      const swap = source[minField];
      source[minField] = source[maxField];
      source[maxField] = swap;
    }
  }

  function saveStateEditor() {
    if (!stateEditor) return;
    setDialogError(elements.stateDialog, "");
    stateEditor.draft.material = normalizeMaterialId(stateEditor.draft.material);
    stateEditor.draft.dynamicStates.forEach(entry => {
      entry.item.material = normalizeMaterialId(entry.item.material);
      validateTickRange(entry, "delayMin", "delayMax", 0);
    });
    const key = stateEditor.key;
    if (stateEditor.draft.dynamicStates.length) {
      const group = state.dynamicGroups.find(entry => entry.slots.includes(key));
      if (group) {
        setDialogError(elements.stateDialog, slotLabel(key) + " 已属于“" + group.name + "”，不能同时配置动态状态");
        return;
      }
    }
    const draft = deepClone(stateEditor.draft);
    elements.stateDialog.close();
    stateEditor = null;
    mutate(() => { state.slots[key] = draft; state.selected = key; });
  }

  function createDynamicDraft(type) {
    return normalizeDynamicGroup({
      id: uid("motion"), type,
      name: (type === "path" ? "轨迹槽 " : "随机槽 ") + (state.dynamicGroups.length + 1),
      slots: [...multiSelection], trigger: defaultTrigger("gui_open"),
      delayMin: 0, delayMax: 0, intervalMin: 10, intervalMax: 10, loop: true
    }, state.dynamicGroups.length);
  }

  function openDynamicEditor(type, index) {
    if (index === undefined && multiSelection.length < 2) return;
    const existing = index === undefined ? null : state.dynamicGroups[index];
    dynamicEditor = { index: index === undefined ? -1 : index, draft: deepClone(existing || createDynamicDraft(type)) };
    setDialogError(elements.dynamicDialog, "");
    $("#dynamicDialogTitle").textContent = dynamicEditor.draft.type === "path" ? "动态轨迹槽" : "动态随机槽";
    $("#deleteDynamicBtn").classList.toggle("hidden", dynamicEditor.index < 0);
    renderDynamicForm();
    elements.dynamicDialog.showModal();
    refreshIcons();
  }

  function renderDynamicForm() {
    if (!dynamicEditor) return;
    const draft = dynamicEditor.draft;
    elements.dynamicForm.elements.name.value = draft.name;
    elements.dynamicForm.elements.delayMin.value = draft.delayMin;
    elements.dynamicForm.elements.delayMax.value = draft.delayMax;
    elements.dynamicForm.elements.intervalMin.value = draft.intervalMin;
    elements.dynamicForm.elements.intervalMax.value = draft.intervalMax;
    elements.dynamicForm.elements.loop.checked = draft.loop;
    $("#dynamicSlotCount").textContent = draft.slots.length + " 个槽位";
    const fragment = document.createDocumentFragment();
    draft.slots.forEach((key, index) => {
      if (index) {
        const arrow = document.createElement("span");
        arrow.className = "slot-path-arrow";
        arrow.textContent = draft.type === "path" ? "→" : "·";
        fragment.append(arrow);
      }
      const node = document.createElement("span");
      node.className = "slot-path-node";
      node.textContent = (index + 1) + " · " + slotLabel(key);
      fragment.append(node);
    });
    $("#dynamicSlotPath").replaceChildren(fragment);
    renderConditionEditor(
      elements.dynamicForm.querySelector("[data-condition-editor]"),
      draft.trigger,
      next => { draft.trigger = next; },
      { currentSlot: "", kind: "group", groupId: draft.id }
    );
  }

  function saveDynamicEditor() {
    if (!dynamicEditor) return;
    setDialogError(elements.dynamicDialog, "");
    const draft = dynamicEditor.draft;
    draft.name = draft.name.trim() || (draft.type === "path" ? "动态轨迹槽" : "动态随机槽");
    draft.slots = [...new Set(draft.slots)].filter(key => activeSlotKeys().includes(key));
    if (draft.slots.length < 2) { setDialogError(elements.dynamicDialog, "动态槽至少需要 2 个有效槽位"); return; }
    const conflict = motionConflict(draft.slots, dynamicEditor.index);
    if (conflict) { setDialogError(elements.dynamicDialog, conflict + "，不能加入动态槽组"); return; }
    validateTickRange(draft, "delayMin", "delayMax", 0);
    validateTickRange(draft, "intervalMin", "intervalMax", 1);
    const index = dynamicEditor.index;
    const saved = deepClone(draft);
    elements.dynamicDialog.close();
    dynamicEditor = null;
    mutate(() => {
      if (index < 0) state.dynamicGroups.push(saved);
      else state.dynamicGroups[index] = saved;
    });
  }

  function findDynamicGroupReferences(groupId, ignoredGroupIndex) {
    const references = [];
    Object.entries(state.slots).forEach(([key, item]) => {
      item.dynamicStates.forEach((entry, index) => {
        if (entry.trigger.type === "group_complete" && entry.trigger.groupId === groupId) {
          references.push(slotLabel(key) + " 的状态 " + (index + 1));
        }
      });
    });
    state.dynamicGroups.forEach((group, index) => {
      if (index === ignoredGroupIndex) return;
      if (group.trigger.type === "group_complete" && group.trigger.groupId === groupId) {
        references.push("动态槽组“" + group.name + "”");
      }
    });
    return references;
  }

  function deleteDynamicEditor() {
    if (!dynamicEditor || dynamicEditor.index < 0) return;
    setDialogError(elements.dynamicDialog, "");
    const index = dynamicEditor.index;
    const group = state.dynamicGroups[index];
    if (!group) {
      setDialogError(elements.dynamicDialog, "动态槽配置已发生变化，请关闭后重试");
      return;
    }
    const references = findDynamicGroupReferences(group.id, index);
    if (references.length) {
      const suffix = references.length > 1 ? " 等 " + references.length + " 处" : "";
      setDialogError(elements.dynamicDialog, "不能删除：“" + group.name + "”仍被 " + references[0] + suffix + " 的条件引用，请先修改引用");
      return;
    }
    elements.dynamicDialog.close();
    dynamicEditor = null;
    mutate(() => { state.dynamicGroups.splice(index, 1); });
  }

  function toggleContainerSlots(keys) {
    const eligible = keys.filter(key => key.startsWith("container:"));
    if (!eligible.length) { showToast("容器槽只能设置在 GUI 容器区域"); return; }
    const current = new Set(state.containerSlots);
    const remove = eligible.every(key => current.has(key));
    if (!remove) {
      const groupedKey = eligible.find(key => state.dynamicGroups.some(group => group.slots.includes(key)));
      if (groupedKey) {
        showToast(slotLabel(groupedKey) + " 已属于动态槽组，不能设为容器槽");
        return;
      }
    }
    mutate(() => {
      eligible.forEach(key => remove ? current.delete(key) : current.add(key));
      state.containerSlots = [...current];
    });
  }

  function randomTicks(minimum, maximum) {
    const min = clampInteger(minimum, 0, 0);
    const max = Math.max(min, clampInteger(maximum, 0, min));
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function setPreviewTimer(callback, ticks) {
    if (!previewRuntime) return null;
    const runtime = previewRuntime;
    const timer = setTimeout(() => {
      runtime.timers.delete(timer);
      if (previewRuntime === runtime) callback();
    }, Math.max(0, ticks) * 50);
    runtime.timers.add(timer);
    return timer;
  }

  function invalidatePreviewSlot(key) {
    if (!previewRuntime) return;
    previewRuntime.slotVersions[key] = (previewRuntime.slotVersions[key] || 0) + 1;
    [...previewRuntime.scheduledStates.keys()].forEach(token => {
      if (!token.startsWith(key + ":")) return;
      const record = previewRuntime.scheduledStates.get(token);
      if (record && record.timer !== null) {
        clearTimeout(record.timer);
        previewRuntime.timers.delete(record.timer);
      }
      previewRuntime.scheduledStates.delete(token);
    });
  }

  function triggerMatches(trigger, event, ownerKey) {
    const target = trigger.targetSlot || ownerKey || "";
    switch (trigger.type) {
      case "gui_open":
        return event.type === "gui_open";
      case "after_previous":
        return event.type === "state_reached" && !!ownerKey && event.key === ownerKey;
      case "state_reached":
        return event.type === "state_reached" && (!target || event.key === target) && Number(event.stateIndex) === Number(trigger.stateIndex);
      case "slot_click":
        return event.type === "slot_click" && (!target || event.key === target);
      case "item_placed":
        return event.type === "item_placed" && (!target || event.key === target) &&
          (!trigger.material || normalizeMaterialId(event.material) === normalizeMaterialId(trigger.material));
      case "item_removed":
        return event.type === "item_removed" && (!target || event.key === target);
      case "slot_matches": {
        if (!previewRuntime || !["gui_open", "item_placed", "item_removed", "state_reached", "slots_changed"].includes(event.type)) return false;
        const candidates = target ? [previewRuntime.items[target]] : Object.values(previewRuntime.items);
        return candidates.some(item => !!item && normalizeMaterialId(item.material) === normalizeMaterialId(trigger.material) && Number(item.amount || 1) >= Number(trigger.amount || 1));
      }
      case "inventory_contains": {
        if (!previewRuntime || !["gui_open", "item_placed", "item_removed", "state_reached", "slots_changed"].includes(event.type)) return false;
        const total = Object.entries(previewRuntime.items)
          .filter(([key, item]) => /^(inventory|hotbar):/.test(key) && item && normalizeMaterialId(item.material) === normalizeMaterialId(trigger.material))
          .reduce((sum, entry) => sum + Number(entry[1].amount || 1), 0);
        return total >= Number(trigger.amount || 1);
      }
      case "random_chance":
        return (ownerKey ? event.type === "state_reached" && event.key === ownerKey : event.type === "gui_open") &&
          Math.random() * 100 < Math.max(0, Math.min(100, Number(trigger.chance) || 0));
      case "group_complete":
        return event.type === "group_complete" && (!trigger.groupId || event.groupId === trigger.groupId);
      default:
        return simulatedTriggerTypes.has(trigger.type) && event.type === "simulate_server";
    }
  }

  function dispatchPreviewEvent(event) {
    if (!previewRuntime) return;
    const active = new Set(activeSlotKeys());
    Object.entries(state.slots).forEach(([key, config]) => {
      if (!active.has(key) || !config.dynamicStates.length) return;
      const currentIndex = previewRuntime.stateIndexes[key] || 0;
      const next = config.dynamicStates[currentIndex];
      if (!next) return;
      const token = key + ":" + (currentIndex + 1);
      if (previewRuntime.scheduledStates.has(token) || !triggerMatches(next.trigger, event, key)) return;
      const expectedVersion = previewRuntime.slotVersions[key] || 0;
      const scheduleRecord = { timer: null };
      previewRuntime.scheduledStates.set(token, scheduleRecord);
      scheduleRecord.timer = setPreviewTimer(() => {
        if (!previewRuntime || previewRuntime.scheduledStates.get(token) !== scheduleRecord) return;
        previewRuntime.scheduledStates.delete(token);
        if ((previewRuntime.slotVersions[key] || 0) !== expectedVersion) return;
        previewRuntime.items[key] = snapshotItem(next.item);
        previewRuntime.stateIndexes[key] = currentIndex + 1;
        previewRuntime.recentChanges.add(key);
        renderBoard();
        setPreviewTimer(() => {
          if (!previewRuntime) return;
          previewRuntime.recentChanges.delete(key);
          renderBoard();
        }, 5);
        dispatchPreviewEvent({ type: "state_reached", key, stateIndex: currentIndex + 1 });
      }, randomTicks(next.delayMin, next.delayMax));
    });
    state.dynamicGroups.forEach(group => {
      if (previewRuntime.startedGroups.has(group.id)) return;
      if (!triggerMatches(group.trigger, event, "")) return;
      previewRuntime.startedGroups.add(group.id);
      setPreviewTimer(() => beginDynamicGroup(group), randomTicks(group.delayMin, group.delayMax));
    });
  }

  function rotatePathItems(group, runtime) {
    const slots = runtime.slots;
    const items = slots.map(key => previewRuntime.items[key] || null);
    for (let index = slots.length - 1; index > 0; index--) {
      if (items[index - 1]) previewRuntime.items[slots[index]] = items[index - 1];
      else delete previewRuntime.items[slots[index]];
    }
    if (items[items.length - 1]) previewRuntime.items[slots[0]] = items[items.length - 1];
    else delete previewRuntime.items[slots[0]];
  }

  function shuffleRandomItems(runtime) {
    const slots = runtime.slots;
    const items = slots.map(key => previewRuntime.items[key] || null);
    const occupied = items.reduce((indices, item, index) => {
      if (item) indices.push(index);
      return indices;
    }, []);
    if (occupied.length === 1) {
      const from = occupied[0];
      let to = from;
      while (to === from) to = Math.floor(Math.random() * slots.length);
      delete previewRuntime.items[slots[from]];
      previewRuntime.items[slots[to]] = items[from];
      runtime.cursor = to;
      return;
    }
    const shuffled = items.slice();
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const value = shuffled[index];
      shuffled[index] = shuffled[swapIndex];
      shuffled[swapIndex] = value;
    }
    if (shuffled.every((item, index) => item === items[index]) && shuffled.length > 1) shuffled.push(shuffled.shift());
    slots.forEach((key, index) => {
      if (shuffled[index]) previewRuntime.items[key] = shuffled[index];
      else delete previewRuntime.items[key];
    });
    let nextCursor = runtime.cursor;
    while (slots.length > 1 && nextCursor === runtime.cursor) nextCursor = Math.floor(Math.random() * slots.length);
    runtime.cursor = nextCursor;
  }

  function beginDynamicGroup(group) {
    if (!previewRuntime) return;
    const slots = group.slots.filter(key => activeSlotKeys().includes(key));
    if (slots.length < 2) return;
    const runtime = { slots, step: 0, cursor: 0 };
    previewRuntime.groupRuntimes[group.id] = runtime;
    previewRuntime.motionCursors[group.id] = slots[0];
    renderBoard();
    const step = () => {
      if (!previewRuntime) return;
      if (group.type === "path") {
        rotatePathItems(group, runtime);
        runtime.cursor = (runtime.cursor + 1) % slots.length;
      } else {
        shuffleRandomItems(runtime);
      }
      runtime.step += 1;
      previewRuntime.motionCursors[group.id] = slots[runtime.cursor];
      renderBoard();
      dispatchPreviewEvent({ type: "slots_changed", keys: slots, groupId: group.id });
      const complete = !group.loop && (group.type === "path" ? runtime.step >= slots.length - 1 : runtime.step >= 1);
      if (complete) {
        delete previewRuntime.motionCursors[group.id];
        renderBoard();
        dispatchPreviewEvent({ type: "group_complete", groupId: group.id });
        return;
      }
      setPreviewTimer(step, randomTicks(group.intervalMin, group.intervalMax));
    };
    setPreviewTimer(step, randomTicks(group.intervalMin, group.intervalMax));
  }

  function startPreview() {
    if (previewRuntime) return;
    const conflict = configurationConflict();
    if (conflict) {
      showToast("无法预览：" + conflict);
      return;
    }
    const items = {};
    activeSlotKeys().forEach(key => {
      if (state.slots[key]) items[key] = snapshotItem(state.slots[key]);
    });
    previewRuntime = {
      items, heldItem: null, timers: new Set(), stateIndexes: {}, slotVersions: {}, scheduledStates: new Map(),
      startedGroups: new Set(), groupRuntimes: {}, motionCursors: {}, recentChanges: new Set()
    };
    multiSelection = [];
    renderLibrary();
    renderBoard();
    renderInspector();
    dispatchPreviewEvent({ type: "gui_open" });
    Object.keys(state.slots).forEach(key => {
      if (activeSlotKeys().includes(key)) dispatchPreviewEvent({ type: "state_reached", key, stateIndex: 0 });
    });
    showToast("预览已开始");
  }

  function stopPreview() {
    if (!previewRuntime) return;
    previewRuntime.timers.forEach(timer => clearTimeout(timer));
    previewRuntime = null;
    renderLibrary();
    renderBoard();
    renderInspector();
    showToast("已退出预览");
  }

  function handlePreviewDrop(key, data) {
    if (!state.containerSlots.includes(key) || data.type !== "material") {
      showToast("预览中只能向容器槽放入物品");
      return;
    }
    placePreviewContainerItem(key, data.material);
  }

  function movePreviewItemToInventory(item) {
    const target = activeSlotKeys().find(key => /^(inventory|hotbar):/.test(key) && !previewRuntime.items[key]);
    if (target) {
      previewRuntime.items[target] = item;
      return target;
    }
    previewRuntime.heldItem = snapshotItem(item);
    renderLibrary();
    return "";
  }

  function markPreviewSlotChanged(key) {
    previewRuntime.recentChanges.add(key);
    setPreviewTimer(() => {
      if (!previewRuntime) return;
      previewRuntime.recentChanges.delete(key);
      renderBoard();
    }, 5);
  }

  function placePreviewContainerItem(key, itemOrMaterial) {
    const placedItem = typeof itemOrMaterial === "string" ? snapshotItem(newItem(itemOrMaterial)) : snapshotItem(itemOrMaterial);
    const material = placedItem.material;
    const previous = previewRuntime.items[key];
    if (previous) {
      delete previewRuntime.items[key];
      movePreviewItemToInventory(previous);
      dispatchPreviewEvent({ type: "item_removed", key, material: previous.material });
    }
    invalidatePreviewSlot(key);
    previewRuntime.items[key] = placedItem;
    markPreviewSlotChanged(key);
    dispatchPreviewEvent({ type: "item_placed", key, material });
    renderBoard();
  }

  function handlePreviewSlotClick(key) {
    if (!previewRuntime) return;
    if (state.containerSlots.includes(key) && previewRuntime.heldItem) {
      const heldItem = previewRuntime.heldItem;
      previewRuntime.heldItem = null;
      placePreviewContainerItem(key, heldItem);
      renderLibrary();
    }
    dispatchPreviewEvent({ type: "slot_click", key });
    renderBoard();
  }

  function handlePreviewContext(key) {
    if (!previewRuntime || !state.containerSlots.includes(key) || !previewRuntime.items[key]) return;
    const removed = previewRuntime.items[key];
    delete previewRuntime.items[key];
    invalidatePreviewSlot(key);
    const destination = movePreviewItemToInventory(removed);
    dispatchPreviewEvent({ type: "item_removed", key, material: removed.material });
    renderBoard();
    showToast(destination ? "已取出至" + slotLabel(destination) : "已取出至鼠标指针");
  }

  function jsonValue(raw) {
    if (!raw || !String(raw).trim()) return undefined;
    try { return JSON.parse(raw); } catch (_) { return raw; }
  }

  function compactObject(object) {
    Object.keys(object).forEach(key => {
      if (object[key] === undefined || object[key] === "" || object[key] === false) delete object[key];
    });
    return object;
  }

  function exportItem(item) {
    return compactObject({
      材质: exportMaterialId(item.material), 数量: +item.amount || 1,
      名称: item.name || undefined, 作用: item.role || undefined, 开发备注: item.note || undefined,
      描述: item.lore ? item.lore.split(/\r?\n/) : undefined,
      附魔光效: item.glint || undefined, 不可破坏: item.unbreakable || undefined,
      自定义模型数据: item.customModelData === "" ? undefined : +item.customModelData,
      附魔: item.enchantments ? item.enchantments.split(/\r?\n/) : undefined,
      属性: jsonValue(item.attributes), NBT_PDC: jsonValue(item.nbt)
    });
  }

  function exportTrigger(trigger, scope) {
    const result = { 类型: trigger.type, 条件: triggerLabel(trigger.type) };
    const assign = (name, value) => { if (value !== undefined && value !== "") result[name] = value; };
    const defaultTarget = scope === "group" ? "任意槽位" : "当前槽位";
    switch (trigger.type) {
      case "state_reached":
        assign("目标槽位", trigger.targetSlot || defaultTarget); assign("状态编号", Number(trigger.stateIndex)); break;
      case "slot_click":
      case "item_removed":
        assign("目标槽位", trigger.targetSlot || defaultTarget); break;
      case "item_placed":
        assign("目标槽位", trigger.targetSlot || defaultTarget);
        if (trigger.material) assign("物品", exportMaterialId(trigger.material));
        break;
      case "slot_matches":
        assign("目标槽位", trigger.targetSlot || defaultTarget);
        assign("物品", exportMaterialId(trigger.material)); assign("最少数量", Number(trigger.amount || 1)); break;
      case "inventory_contains":
        assign("物品", exportMaterialId(trigger.material)); assign("最少数量", Number(trigger.amount || 1)); break;
      case "permission":
        assign("权限节点", trigger.permission); break;
      case "placeholder":
        assign("变量", trigger.placeholder); assign("比较方式", trigger.operator); assign("比较值", trigger.value); break;
      case "player_stat":
        assign("玩家属性", trigger.attribute); assign("比较方式", trigger.operator); assign("比较值", trigger.value); break;
      case "economy":
        assign("比较方式", trigger.operator); assign("余额", trigger.value); break;
      case "game_mode":
        assign("游戏模式", trigger.value); break;
      case "world":
        assign("世界", trigger.world); break;
      case "world_time":
        assign("起始时间", Number(trigger.timeMin)); assign("结束时间", Number(trigger.timeMax)); break;
      case "weather":
        assign("天气", trigger.weather); break;
      case "command":
        assign("命令", trigger.command); break;
      case "custom_event":
        assign("事件标识", trigger.event); break;
      case "random_chance":
        assign("概率", Number(trigger.chance) + "%"); break;
      case "group_complete":
        assign("动态槽组ID", trigger.groupId); break;
    }
    return result;
  }

  function tickRange(minimum, maximum) { return { 最小: Number(minimum) || 0, 最大: Number(maximum) || 0 }; }

  function exportObject() {
    const slots = {};
    const active = new Set(activeSlotKeys());
    active.forEach(key => {
      const item = state.slots[key];
      const isContainer = state.containerSlots.includes(key);
      if (!item && !isContainer) return;
      slots[key] = item ? exportItem(item) : { 材质: "minecraft:air", 数量: 1 };
      if (isContainer) {
        slots[key].容器槽 = true;
        slots[key].允许玩家放入 = true;
        slots[key].放入后替换展示物品 = true;
      }
      if (item && item.dynamicStates.length) {
        slots[key].动态状态 = item.dynamicStates.map((entry, index) => ({
          状态: index + 1,
          进入条件: exportTrigger(entry.trigger, "state"),
          延迟Tick: tickRange(entry.delayMin, entry.delayMax),
          物品: exportItem(entry.item)
        }));
      }
    });
    const groups = state.dynamicGroups.map(group => ({
      ID: group.id, 名称: group.name,
      类型: group.type === "path" ? "按路径顺序移动" : "在选中范围随机移动",
      槽位顺序: group.slots.filter(key => active.has(key)),
      启动条件: exportTrigger(group.trigger, "group"),
      启动延迟Tick: tickRange(group.delayMin, group.delayMax),
      移动间隔Tick: tickRange(group.intervalMin, group.intervalMax),
      循环: group.loop
    })).filter(group => group.槽位顺序.length >= 2);
    return {
      配置版本: SCHEMA_VERSION, Minecraft版本: VERSION, 界面标题: state.title,
      布局类型: state.layout === "chest54" ? "6x9箱子+3x9背包+9物品栏" : "3x9箱子+3x9背包+9物品栏",
      动态槽组: groups, 槽位: slots
    };
  }

  function yamlString(value) {
    return "\"" + String(value === undefined ? "" : value)
      .replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n") + "\"";
  }

  function yamlScalar(value) {
    if (value === null) return "null";
    if (typeof value === "boolean" || typeof value === "number") return String(value);
    return yamlString(value);
  }

  function appendYaml(lines, value, indent) {
    const prefix = " ".repeat(indent);
    if (Array.isArray(value)) {
      if (!value.length) { lines.push(prefix + "[]"); return; }
      value.forEach(entry => {
        if (entry && typeof entry === "object") {
          lines.push(prefix + "-");
          appendYaml(lines, entry, indent + 2);
        } else {
          lines.push(prefix + "- " + yamlScalar(entry));
        }
      });
      return;
    }
    const entries = Object.entries(value || {});
    if (!entries.length) { lines.push(prefix + "{}"); return; }
    entries.forEach(([key, entry]) => {
      if (entry && typeof entry === "object") {
        lines.push(prefix + yamlString(key) + ":");
        appendYaml(lines, entry, indent + 2);
      } else {
        lines.push(prefix + yamlString(key) + ": " + yamlScalar(entry));
      }
    });
  }

  function toYaml(data) {
    const lines = [];
    appendYaml(lines, data, 0);
    return lines.join("\n");
  }

  function outputFor(format) {
    const data = exportObject();
    if (format === "json") return JSON.stringify(data, null, 2);
    const yaml = toYaml(data);
    if (format === "prompt") return [
      "请使用 $develop-minecraft-server-plugin 根据下面的 GUI 配置辅助开发 Minecraft 插件。",
      "请将槽位作用、动态状态、触发条件、随机 tick 范围、动态槽轨迹和容器槽规则转换为功能及验收标准。",
      "条件涉及权限、经济、Placeholder 或插件事件时，请先确认项目中对应依赖和事件来源。",
      "", "~~~yaml", yaml, "~~~"
    ].join("\n");
    return yaml;
  }

  window.MC_GUI_EDITOR_EXPORT = format => {
    const selectedFormat = ["yaml", "json", "prompt"].includes(format) ? format : "json";
    return outputFor(selectedFormat);
  };

  function updateExport() { elements.exportOutput.value = outputFor(exportFormat); }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    setTimeout(() => elements.toast.classList.remove("show"), 1600);
  }

  function populateMaterialOptions() {
    const list = $("#materialOptions");
    const fragment = document.createDocumentFragment();
    (Array.isArray(window.MC_ITEMS) ? window.MC_ITEMS : []).forEach(id => {
      const option = document.createElement("option");
      option.value = id;
      fragment.append(option);
    });
    list.replaceChildren(fragment);
  }

  function bindEvents() {
    elements.search.addEventListener("input", renderLibrary);
    document.querySelectorAll("[data-layout]").forEach(button => button.addEventListener("click", () => {
      if (previewRuntime || button.dataset.layout === state.layout) return;
      multiSelection = [];
      mutate(() => { state.layout = button.dataset.layout; state.selected = null; });
    }));
    elements.guiTitle.addEventListener("focus", () => { if (!previewRuntime) formSnapshot = cloneState(); });
    elements.guiTitle.addEventListener("input", event => {
      if (previewRuntime) return;
      state.title = event.target.value;
      scheduleSave();
    });
    elements.guiTitle.addEventListener("change", () => {
      if (formSnapshot) pushHistory(formSnapshot);
      formSnapshot = null;
    });
    elements.itemForm.addEventListener("focusin", () => {
      if (!previewRuntime && !formSnapshot) formSnapshot = cloneState();
    });
    elements.itemForm.addEventListener("input", event => {
      if (previewRuntime || !event.target.name || !state.selected || !state.slots[state.selected]) return;
      state.slots[state.selected][event.target.name] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      renderBoard();
      scheduleSave();
    });
    elements.itemForm.addEventListener("focusout", event => {
      if (event.relatedTarget && elements.itemForm.contains(event.relatedTarget)) return;
      if (formSnapshot) pushHistory(formSnapshot);
      formSnapshot = null;
    });
    $("#removeItemBtn").addEventListener("click", () => {
      if (state.selected) mutate(() => { delete state.slots[state.selected]; });
    });
    $("#editStatesBtn").addEventListener("click", () => {
      if (state.selected) openStateEditor(state.selected);
    });
    elements.undo.addEventListener("click", undo);
    elements.redo.addEventListener("click", redo);
    $("#clearBtn").addEventListener("click", () => {
      if (previewRuntime) return;
      const hasConfig = Object.keys(state.slots).length || state.containerSlots.length || state.dynamicGroups.length;
      if (!hasConfig || !confirm("清空当前编辑器中的全部槽位与动态配置？")) return;
      multiSelection = [];
      mutate(() => {
        state.slots = {};
        state.containerSlots = [];
        state.dynamicGroups = [];
        state.selected = null;
      });
    });
    $("#clearSelectionBtn").addEventListener("click", () => { multiSelection = []; renderBoard(); });
    $("#createPathBtn").addEventListener("click", () => openDynamicEditor("path"));
    $("#createRandomBtn").addEventListener("click", () => openDynamicEditor("random"));
    $("#setContainerBtn").addEventListener("click", () => toggleContainerSlots(multiSelection));
    $("#simulateConditionBtn").addEventListener("click", () => {
      if (!previewRuntime) return;
      dispatchPreviewEvent({ type: "simulate_server" });
      showToast("已模拟服务端条件");
    });
    elements.previewButton.addEventListener("click", () => previewRuntime ? stopPreview() : startPreview());
    $("#toolbarCollapseBtn").addEventListener("click", () => {
      elements.dynamicToolbar.classList.toggle("collapsed");
      const collapsed = elements.dynamicToolbar.classList.contains("collapsed");
      localStorage.setItem(TOOLBAR_KEY, collapsed ? "1" : "0");
      $("#toolbarCollapseBtn").title = collapsed ? "展开动态工具栏" : "收起动态工具栏";
      $("#toolbarCollapseBtn").setAttribute("aria-label", collapsed ? "展开动态工具栏" : "收起动态工具栏");
    });
    elements.contextMenu.addEventListener("click", event => {
      const action = event.target.closest("[data-context-action]");
      if (!action || !contextSlot) return;
      const key = contextSlot;
      const name = action.dataset.contextAction;
      hideContextMenu();
      if (name === "states") openStateEditor(key);
      if (name === "container") toggleContainerSlots([key]);
      if (name === "remove") mutate(() => { delete state.slots[key]; });
    });
    document.addEventListener("pointerdown", event => {
      if (!elements.contextMenu.classList.contains("hidden") && !elements.contextMenu.contains(event.target)) hideContextMenu();
    });
    $("#addStateBtn").addEventListener("click", addDynamicState);
    $("#deleteStateBtn").addEventListener("click", deleteDynamicState);
    $("#saveStateBtn").addEventListener("click", saveStateEditor);
    elements.stateForm.addEventListener("submit", event => event.preventDefault());
    elements.stateForm.addEventListener("input", event => {
      if (!stateEditor || !event.target.name) return;
      const index = stateEditor.activeIndex;
      const item = stateItemAt(stateEditor.draft, index);
      if (ITEM_FIELDS.includes(event.target.name)) {
        item[event.target.name] = event.target.type === "checkbox" ? event.target.checked :
          (event.target.type === "number" ? Number(event.target.value) : event.target.value);
      } else if (index > 0 && ["delayMin", "delayMax"].includes(event.target.name)) {
        stateEditor.draft.dynamicStates[index - 1][event.target.name] = Number(event.target.value);
      }
    });
    elements.stateForm.addEventListener("change", event => {
      if (event.target.name === "material" || event.target.name === "name") renderStateList();
    });
    elements.dynamicForm.addEventListener("submit", event => event.preventDefault());
    elements.dynamicForm.addEventListener("input", event => {
      if (!dynamicEditor || !event.target.name) return;
      dynamicEditor.draft[event.target.name] = event.target.type === "checkbox" ? event.target.checked :
        (event.target.type === "number" ? Number(event.target.value) : event.target.value);
    });
    $("#saveDynamicBtn").addEventListener("click", saveDynamicEditor);
    $("#deleteDynamicBtn").addEventListener("click", deleteDynamicEditor);
    document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.closeDialog);
      if (dialog && dialog.open) dialog.close();
    }));
    elements.stateDialog.addEventListener("close", () => { stateEditor = null; });
    elements.dynamicDialog.addEventListener("close", () => { dynamicEditor = null; });
    document.addEventListener("keydown", event => {
      if (event.key === "Control" || event.key === "Meta") {
        ctrlPressed = true;
        document.body.classList.add("ctrl-select-mode");
      }
      if (event.key === "Escape") hideContextMenu();
      if ((event.key === "Delete" || event.key === "Backspace") && !previewRuntime && state.selected &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !elements.stateDialog.open && !elements.dynamicDialog.open) {
        event.preventDefault();
        mutate(() => { delete state.slots[state.selected]; });
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z" && !elements.stateDialog.open && !elements.dynamicDialog.open) {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
      }
    });
    document.addEventListener("keyup", event => {
      if (event.key === "Control" || event.key === "Meta") {
        ctrlPressed = false;
        document.body.classList.remove("ctrl-select-mode");
      }
    });
    window.addEventListener("blur", () => {
      ctrlPressed = false;
      document.body.classList.remove("ctrl-select-mode");
      hideContextMenu();
    });
    $("#exportBtn").addEventListener("click", () => {
      updateExport();
      elements.exportDialog.showModal();
      refreshIcons();
    });
    $("#closeExportBtn").addEventListener("click", () => elements.exportDialog.close());
    $("#exportFormat").addEventListener("click", event => {
      const button = event.target.closest("button[data-format]");
      if (!button) return;
      exportFormat = button.dataset.format;
      document.querySelectorAll("[data-format]").forEach(item => item.classList.toggle("active", item === button));
      updateExport();
    });
    $("#copyBtn").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(elements.exportOutput.value);
        showToast("已复制导出内容");
      } catch (_) {
        elements.exportOutput.select();
        document.execCommand("copy");
        showToast("已复制导出内容");
      }
    });
    $("#downloadBtn").addEventListener("click", () => {
      const extension = exportFormat === "yaml" ? "yml" : exportFormat === "json" ? "json" : "md";
      const blob = new Blob([elements.exportOutput.value], { type: "text/plain;charset=utf-8" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "minecraft-gui-config." + extension;
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  elements.guiTitle.value = state.title;
  if (localStorage.getItem(TOOLBAR_KEY) === "1") {
    elements.dynamicToolbar.classList.add("collapsed");
    $("#toolbarCollapseBtn").title = "展开动态工具栏";
    $("#toolbarCollapseBtn").setAttribute("aria-label", "展开动态工具栏");
  }
  populateMaterialOptions();
  bindEvents();
  renderAll();
  updateHistoryButtons();
})();
