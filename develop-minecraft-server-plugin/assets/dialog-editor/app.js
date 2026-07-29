(() => {
  "use strict";

  const VERSION = "26.2";
  const STORAGE_KEY = "mc-dialog-editor-v2";
  const LEGACY_STORAGE_KEY = "mc-dialog-editor-v1";
  const typeNames = {
    notice: "通知型",
    confirmation: "确认型",
    multi_action: "多动作型",
    dialog_list: "Dialog 列表",
    server_links: "服务器链接"
  };
  const kindNames = {
    plain_message: "文本正文",
    item: "物品正文",
    text: "文本输入",
    boolean: "开关输入",
    number_range: "数值范围",
    single_option: "单选输入"
  };
  const actionKindNames = {
    none: "仅关闭/返回",
    command_template: "命令模板",
    custom_click: "自定义 Click ID",
    static_click: "Adventure ClickEvent",
    callback_binding: "Java 回调绑定"
  };
  const staticClickEventNames = {
    open_url: "打开 URL",
    open_file: "打开文件",
    run_command: "执行命令",
    suggest_command: "填入命令",
    change_page: "切换书页",
    copy_to_clipboard: "复制到剪贴板",
    show_dialog: "打开 Dialog",
    custom: "发送自定义事件"
  };
  const exitTypes = new Set(["multi_action", "dialog_list", "server_links"]);
  const minecraftItemIds = new Set((Array.isArray(window.MC_ITEMS) ? window.MC_ITEMS : []).map(id => String(id).toLowerCase()));
  const attributeOperations = new Set(["add_value", "add_multiplied_base", "add_multiplied_total"]);
  const listKey = group => group === "body" ? "bodies" : `${group}s`;
  let serial = 0;
  const uid = prefix => `${prefix}_${Date.now().toString(36)}_${(++serial).toString(36)}`;

  const newAction = (label = "执行") => ({
    id: uid("action"),
    label,
    tooltip: "",
    width: 150,
    actionKind: "custom_click",
    commandTemplate: "say dialog submitted",
    customClickId: "plugin:dialog_action",
    additions: "",
    clickEvent: "run_command",
    clickValue: "",
    handlerId: "dialog_action",
    developmentNote: ""
  });

  const newBody = kind => kind === "item"
    ? {
        id: uid("body"), kind, material: "diamond", amount: 1,
        itemName: "", lore: "", glint: false, unbreakable: false,
        customModelData: "", enchantments: "", attributes: "", extraNbt: "",
        description: "展示物品说明", descriptionWidth: 256,
        showDecorations: true, showTooltip: true, width: 64, height: 64,
        developmentNote: ""
      }
    : { id: uid("body"), kind, contents: "请填写 Dialog 正文内容。", width: 400, developmentNote: "" };

  const newInput = kind => {
    const base = { id: uid("input"), kind, key: `input_${serial}`, label: "输入项", developmentNote: "" };
    if (kind === "boolean") return { ...base, initial: false, onTrue: "true", onFalse: "false" };
    if (kind === "number_range") return { ...base, start: 0, end: 100, width: 400, labelFormat: "%s: %s", hasInitial: true, initial: 50, hasStep: true, step: 1 };
    if (kind === "single_option") return { ...base, width: 400, labelVisible: true, entries: "option_a|选项 A|true\noption_b|选项 B|false" };
    return { ...base, width: 400, labelVisible: true, initial: "", maxLength: 128, multiline: false, maxLines: 4, height: 80 };
  };

  const defaultState = () => ({
    schemaVersion: 2,
    id: "plugin:example_dialog",
    title: "功能确认",
    externalTitle: "打开功能确认",
    textFormat: "mini_message",
    type: "notice",
    canCloseWithEscape: true,
    pause: false,
    afterAction: "close",
    typeSettings: {
      columns: 2,
      buttonWidth: 150,
      dialogSource: "keys",
      dialogRefs: "plugin:first_dialog\nplugin:second_dialog",
      dialogTag: "plugin:dialog_group",
      exitActionEnabled: true
    },
    bodies: [newBody("plain_message")],
    inputs: [newInput("text")],
    actions: [newAction("提交")],
    exitAction: newAction("关闭"),
    selected: { group: "base", id: null }
  });

  function normalizeAction(raw, fallbackLabel = "执行") {
    const source = raw && typeof raw === "object" ? raw : {};
    const kind = Object.hasOwn(actionKindNames, source.actionKind) ? source.actionKind : "custom_click";
    const defaults = newAction(source.label || fallbackLabel);
    const legacyValue = source.value == null ? null : String(source.value);
    return {
      ...defaults,
      ...source,
      id: source.id || uid("action"),
      actionKind: kind,
      commandTemplate: source.commandTemplate ?? (kind === "command_template" && legacyValue !== null ? legacyValue : defaults.commandTemplate),
      customClickId: source.customClickId ?? (kind === "custom_click" && legacyValue ? legacyValue : defaults.customClickId),
      clickValue: source.clickValue ?? (kind === "static_click" && legacyValue !== null ? legacyValue : defaults.clickValue),
      developmentNote: source.developmentNote || ""
    };
  }

  function normalizeBody(raw) {
    const kind = raw?.kind === "item" ? "item" : "plain_message";
    return { ...newBody(kind), ...(raw || {}), id: raw?.id || uid("body"), kind };
  }

  function normalizeInput(raw) {
    const kind = Object.hasOwn(kindNames, raw?.kind) && !["plain_message", "item"].includes(raw.kind) ? raw.kind : "text";
    return { ...newInput(kind), ...(raw || {}), id: raw?.id || uid("input"), kind };
  }

  function normalizeState(raw) {
    const defaults = defaultState();
    if (!raw || typeof raw !== "object") return defaults;
    const sourceType = Object.hasOwn(typeNames, raw.type) ? raw.type : defaults.type;
    const typeSettings = { ...defaults.typeSettings, ...(raw.typeSettings || {}) };
    if (!new Set(["keys", "tag"]).has(typeSettings.dialogSource)) typeSettings.dialogSource = "keys";
    if (raw.typeSettings && !Object.hasOwn(raw.typeSettings, "exitActionEnabled")) {
      typeSettings.exitActionEnabled = Boolean(raw.typeSettings.exitLabel);
    }
    const normalized = {
      ...defaults,
      ...raw,
      schemaVersion: 2,
      type: sourceType,
      textFormat: ["plain", "mini_message", "json"].includes(raw.textFormat) ? raw.textFormat : defaults.textFormat,
      typeSettings,
      bodies: Array.isArray(raw.bodies) ? raw.bodies.map(normalizeBody) : defaults.bodies,
      inputs: Array.isArray(raw.inputs) ? raw.inputs.map(normalizeInput) : defaults.inputs,
      actions: Array.isArray(raw.actions) ? raw.actions.map(action => normalizeAction(action)) : defaults.actions,
      exitAction: normalizeAction(raw.exitAction || { label: raw.typeSettings?.exitLabel || "关闭" }, "关闭"),
      selected: raw.selected && typeof raw.selected === "object" ? raw.selected : defaults.selected
    };
    const selected = normalized.selected;
    const selectedExists = selected.group === "base" ||
      (selected.group === "exit" && typeSettings.exitActionEnabled) ||
      (["body", "input", "action"].includes(selected.group) && normalized[listKey(selected.group)]?.some(entry => entry.id === selected.id));
    if (!selectedExists) normalized.selected = { group: "base", id: null };
    return normalized;
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      return normalizeState(saved ? JSON.parse(saved) : null);
    } catch (_) {
      return defaultState();
    }
  }

  let state = loadState();
  let undoStack = [];
  let redoStack = [];
  let fieldBefore = null;
  let saveTimer;
  let exportFormat = "yaml";
  let pickerTarget = null;

  const $ = selector => document.querySelector(selector);
  const els = {
    bodyList: $("#bodyList"), inputList: $("#inputList"), actionList: $("#actionList"),
    actionSectionLabel: $("#actionSectionLabel"), addAction: $("#addActionBtn"),
    inspector: $("#inspectorContent"), inspectorTitle: $("#inspectorTitle"),
    preview: $("#dialogPreview"), previewType: $("#previewType"), typeSummary: $("#typeSummary"),
    validationState: $("#validationState"), elementCount: $("#elementCount"), saveState: $("#saveState"),
    undo: $("#undoBtn"), redo: $("#redoBtn"), picker: $("#itemPicker"),
    itemSearch: $("#itemSearch"), itemCount: $("#itemCount"), pickerGrid: $("#pickerGrid"),
    exportDialog: $("#exportDialog"), exportOutput: $("#exportOutput"), exportNote: $("#exportNote"),
    download: $("#downloadBtn"), copy: $("#copyBtn"), toast: $("#toast")
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  function safeSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      els.saveState.textContent = "已保存";
    } catch (_) {
      els.saveState.textContent = "仅本次会话";
    }
  }

  function scheduleSave() {
    els.saveState.textContent = "保存中";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(safeSave, 180);
  }

  function updateHistory() {
    els.undo.disabled = !undoStack.length;
    els.redo.disabled = !redoStack.length;
  }

  function pushHistory(before) {
    if (!before || same(before, state)) return;
    undoStack.push(before);
    if (undoStack.length > 80) undoStack.shift();
    redoStack = [];
    updateHistory();
    scheduleSave();
  }

  function mutate(change) {
    const before = clone(state);
    fieldBefore = null;
    change();
    pushHistory(before);
    renderAll();
  }

  function restore(source, target) {
    if (!source.length) return;
    target.push(clone(state));
    state = source.pop();
    fieldBefore = null;
    renderAll();
    scheduleSave();
  }

  function visibleActions() {
    if (state.type === "notice") return state.actions.slice(0, 1);
    if (state.type === "confirmation") return state.actions.slice(0, 2);
    if (state.type === "multi_action") return state.actions;
    return [];
  }

  function selectedObject() {
    if (state.selected.group === "base") return state;
    if (state.selected.group === "exit") return state.exitAction;
    const list = state[listKey(state.selected.group)];
    return list?.find(entry => entry.id === state.selected.id) || null;
  }

  function selectEntry(group, id) {
    state.selected = { group, id };
    renderAll();
  }

  function makeTreeEntry(group, entry, index, length) {
    const node = document.createElement("div");
    const active = state.selected.group === group && state.selected.id === entry.id;
    const isExit = group === "exit";
    const icon = group === "body" ? (entry.kind === "item" ? "diamond" : "text") : group === "input" ? "list-filter" : isExit ? "log-out" : "mouse-pointer-click";
    const label = group === "action" || isExit ? (entry.label || "未命名按钮") : (entry.label || entry.contents || entry.material || kindNames[entry.kind]);
    const sub = isExit ? "exit_action" : group === "action" ? entry.actionKind : group === "input" ? entry.key : kindNames[entry.kind];
    node.className = `tree-entry${active ? " active" : ""}`;
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-label", `${label}，${sub}`);
    const moveControls = isExit ? "" : `<button data-move="-1" title="上移" aria-label="上移"><i data-lucide="chevron-up"></i></button><button data-move="1" title="下移" aria-label="下移"><i data-lucide="chevron-down"></i></button>`;
    node.innerHTML = `<span class="tree-icon"><i data-lucide="${icon}"></i></span><span class="tree-entry-text"><strong></strong><small></small></span><span class="tree-entry-controls">${moveControls}<button data-remove title="删除" aria-label="删除"><i data-lucide="x"></i></button></span>`;
    node.querySelector("strong").textContent = String(label).slice(0, 28);
    node.querySelector("small").textContent = sub;
    const choose = () => selectEntry(group, entry.id);
    node.addEventListener("click", choose);
    node.addEventListener("keydown", event => {
      if (event.target !== node) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choose();
      }
    });
    node.querySelectorAll("[data-move]").forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const offset = Number(button.dataset.move);
      const next = index + offset;
      if (next < 0 || next >= length) return;
      mutate(() => {
        const list = state[listKey(group)];
        [list[index], list[next]] = [list[next], list[index]];
      });
    }));
    node.querySelector("[data-remove]").addEventListener("click", event => {
      event.stopPropagation();
      mutate(() => {
        if (isExit) state.typeSettings.exitActionEnabled = false;
        else state[listKey(group)] = state[listKey(group)].filter(item => item.id !== entry.id);
        state.selected = { group: "base", id: null };
      });
    });
    return node;
  }

  function emptyEntry(text) {
    const node = document.createElement("div");
    node.className = "tree-empty";
    node.textContent = text;
    return node;
  }

  function renderLists() {
    const actions = visibleActions();
    els.bodyList.replaceChildren(...(state.bodies.length ? state.bodies.map((entry, index) => makeTreeEntry("body", entry, index, state.bodies.length)) : [emptyEntry("尚无正文") ]));
    els.inputList.replaceChildren(...(state.inputs.length ? state.inputs.map((entry, index) => makeTreeEntry("input", entry, index, state.inputs.length)) : [emptyEntry("尚无输入控件") ]));
    const actionNodes = actions.map((entry, index) => makeTreeEntry("action", entry, index, state.actions.length));
    if (exitTypes.has(state.type) && state.typeSettings.exitActionEnabled) actionNodes.push(makeTreeEntry("exit", state.exitAction, 0, 1));
    els.actionList.replaceChildren(...(actionNodes.length ? actionNodes : [emptyEntry(state.type === "notice" ? "将使用 Paper 默认按钮" : "尚无动作按钮") ]));
    els.actionSectionLabel.textContent = ["dialog_list", "server_links"].includes(state.type) ? "退出按钮" : "动作按钮";
    els.addAction.title = ["dialog_list", "server_links"].includes(state.type) ? "添加退出按钮" : "添加动作按钮";
    els.addAction.setAttribute("aria-label", els.addAction.title);
    document.querySelector(".base-entry").classList.toggle("active", state.selected.group === "base");
    els.typeSummary.textContent = typeNames[state.type];
  }

  const field = (label, name, value, type = "text", attrs = "") => `<label class="field">${label}<input data-field="${name}" type="${type}" value="${escapeAttr(value ?? "")}" ${attrs}></label>`;
  const area = (label, name, value, rows = 3, placeholder = "") => `<label class="field">${label}<textarea data-field="${name}" rows="${rows}" placeholder="${escapeAttr(placeholder)}">${escapeHtml(value ?? "")}</textarea></label>`;
  const toggle = (label, name, checked) => `<label class="switch"><input data-field="${name}" type="checkbox" ${checked ? "checked" : ""}><span></span>${label}</label>`;
  const selectField = (label, name, value, options) => `<label class="field">${label}<select data-field="${name}">${options.map(([optionValue, text]) => `<option value="${optionValue}" ${optionValue === value ? "selected" : ""}>${text}</option>`).join("")}</select></label>`;

  function escapeHtml(value) {
    return String(value).replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]);
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
  }

  function renderBaseInspector() {
    els.inspectorTitle.textContent = "基础设置";
    let typeFields = "";
    if (state.type === "multi_action") {
      typeFields += field("按钮列数", "typeSettings.columns", state.typeSettings.columns, "number", 'min="1" step="1"');
      typeFields += `<div class="switch-row">${toggle("启用退出按钮", "typeSettings.exitActionEnabled", state.typeSettings.exitActionEnabled)}</div>`;
    }
    if (["dialog_list", "server_links"].includes(state.type)) {
      typeFields += `<div class="field-row">${field("按钮列数", "typeSettings.columns", state.typeSettings.columns, "number", 'min="1" step="1"')}${field("列表按钮宽度", "typeSettings.buttonWidth", state.typeSettings.buttonWidth, "number", 'min="1" max="1024" step="1"')}</div>`;
      typeFields += `<div class="switch-row">${toggle("启用退出按钮", "typeSettings.exitActionEnabled", state.typeSettings.exitActionEnabled)}</div>`;
    }
    if (state.type === "dialog_list") {
      typeFields += selectField("Dialog 集合来源", "typeSettings.dialogSource", state.typeSettings.dialogSource, [["keys", "注册键列表"], ["tag", "Dialog Tag"]]);
      typeFields += state.typeSettings.dialogSource === "tag"
        ? field("Dialog Tag", "typeSettings.dialogTag", state.typeSettings.dialogTag, "text", 'placeholder="plugin:dialog_group"')
        : area("Dialog ID（每行一个）", "typeSettings.dialogRefs", state.typeSettings.dialogRefs, 6, "plugin:first_dialog");
    }
    if (state.type === "server_links") typeFields += `<p class="inline-help">链接项目由玩家连接携带的 ServerLinks 提供；编辑器只配置排列与可选退出按钮。</p>`;
    if (state.type === "confirmation") typeFields += `<p class="inline-help">动作列表中的前两个按钮依次映射为确认与取消按钮。</p>`;
    if (state.type === "notice") typeFields += `<p class="inline-help">第一个动作映射为通知按钮；删除全部动作后使用 Paper 默认按钮。</p>`;
    els.inspector.innerHTML = `${field("Dialog ID（留空表示匿名 Dialog）", "id", state.id, "text", 'placeholder="plugin:example_dialog"')}${selectField("文本解析格式", "textFormat", state.textFormat, [["mini_message", "MiniMessage"], ["plain", "纯文本"], ["json", "Adventure JSON"]])}${field("标题", "title", state.title)}${field("外部标题", "externalTitle", state.externalTitle)}${selectField("Dialog 类型", "type", state.type, Object.entries(typeNames))}<div class="switch-row">${toggle("允许 Esc 关闭", "canCloseWithEscape", state.canCloseWithEscape)}${toggle("暂停单人游戏", "pause", state.pause)}</div>${selectField("动作后行为", "afterAction", state.afterAction, [["close", "关闭并返回"], ["none", "保持界面"], ["wait_for_response", "等待服务端响应"]])}<div class="group-label">类型设置</div>${typeFields}`;
  }

  function renderBodyInspector(body) {
    els.inspectorTitle.textContent = kindNames[body.kind];
    if (body.kind === "plain_message") {
      els.inspector.innerHTML = `${area("正文内容", "contents", body.contents, 7, "按基础设置中的文本格式解析")}${field("正文宽度", "width", body.width, "number", 'min="1" max="1024" step="1"')}${area("开发备注", "developmentNote", body.developmentNote, 3, "说明此正文的业务作用")}<button class="danger-button" data-delete-selected>删除正文</button>`;
      return;
    }
    els.inspector.innerHTML = `<label class="field">展示物品<div class="material-control"><input data-field="material" value="${escapeAttr(body.material)}"><button type="button" data-open-picker title="选择物品" aria-label="选择物品"><i data-lucide="search"></i></button></div></label><div class="field-row">${field("数量", "amount", body.amount, "number", 'min="1" max="99" step="1"')}${field("自定义模型数据", "customModelData", body.customModelData)}</div>${field("物品名称", "itemName", body.itemName)}${area("Lore（每行一条）", "lore", body.lore, 4)}<div class="switch-row">${toggle("附魔光效", "glint", body.glint)}${toggle("不可破坏", "unbreakable", body.unbreakable)}</div>${area("附魔（ID|等级）", "enchantments", body.enchantments, 3, "minecraft:unbreaking|1")}${area("属性（ID|数值|运算|槽位）", "attributes", body.attributes, 3, "minecraft:attack_damage|5|add_value|mainhand")}${area("额外组件 / NBT", "extraNbt", body.extraNbt, 4, "JSON 或 SNBT，由实现按目标 API 转换")}<div class="group-label">正文展示</div>${area("物品说明", "description", body.description, 4)}${field("说明宽度", "descriptionWidth", body.descriptionWidth, "number", 'min="1" max="1024" step="1"')}<div class="switch-row">${toggle("显示装饰", "showDecorations", body.showDecorations)}${toggle("显示提示", "showTooltip", body.showTooltip)}</div><div class="field-row">${field("物品区域宽度", "width", body.width, "number", 'min="1" max="256" step="1"')}${field("物品区域高度", "height", body.height, "number", 'min="1" max="256" step="1"')}</div>${area("开发备注", "developmentNote", body.developmentNote, 3, "说明物品的业务作用")}<button class="danger-button" data-delete-selected>删除正文</button>`;
  }

  function renderInputInspector(input) {
    els.inspectorTitle.textContent = kindNames[input.kind];
    let specific = "";
    if (input.kind === "text") {
      specific = `<div class="field-row">${field("宽度", "width", input.width, "number", 'min="1" max="1024" step="1"')}${field("最大长度", "maxLength", input.maxLength, "number", 'min="1" step="1"')}</div>${field("初始文本", "initial", input.initial)}<div class="switch-row">${toggle("显示标签", "labelVisible", input.labelVisible)}${toggle("多行文本", "multiline", input.multiline)}</div>${input.multiline ? `<div class="field-row">${field("最大行数", "maxLines", input.maxLines, "number", 'min="1" step="1"')}${field("输入框高度", "height", input.height, "number", 'min="1" max="512" step="1"')}</div>` : ""}`;
    }
    if (input.kind === "boolean") {
      specific = `<div class="switch-row">${toggle("默认开启", "initial", input.initial)}</div><div class="field-row">${field("开启模板值", "onTrue", input.onTrue)}${field("关闭模板值", "onFalse", input.onFalse)}</div>`;
    }
    if (input.kind === "number_range") {
      specific = `<div class="field-row">${field("起始值", "start", input.start, "number", 'step="any"')}${field("结束值", "end", input.end, "number", 'step="any"')}</div><div class="switch-row">${toggle("指定初始值", "hasInitial", input.hasInitial)}${toggle("指定步长", "hasStep", input.hasStep)}</div>${input.hasInitial ? field("初始值", "initial", input.initial, "number", 'step="any"') : ""}${input.hasStep ? field("步长", "step", input.step, "number", 'min="0.0001" step="any"') : ""}${field("宽度", "width", input.width, "number", 'min="1" max="1024" step="1"')}${field("标签格式", "labelFormat", input.labelFormat)}`;
    }
    if (input.kind === "single_option") {
      specific = `${area("选项（ID|显示文本|是否默认）", "entries", input.entries, 7, "easy|简单|true")}${field("宽度", "width", input.width, "number", 'min="1" max="1024" step="1"')}<div class="switch-row">${toggle("显示标签", "labelVisible", input.labelVisible)}</div>`;
    }
    els.inspector.innerHTML = `${field("输入 Key", "key", input.key, "text", 'placeholder="player_name"')}${field("标签", "label", input.label)}<p class="inline-help">响应值通过此 Key 读取，同一 Dialog 内必须唯一；服务端仍需验证类型和值域。</p><div class="group-label">输入设置</div>${specific}${area("开发备注", "developmentNote", input.developmentNote, 3, "说明输入值的业务用途与校验规则")}<button class="danger-button" data-delete-selected>删除输入控件</button>`;
  }

  function renderActionInspector(action, isExit = false) {
    els.inspectorTitle.textContent = isExit ? "退出按钮" : "动作按钮";
    let settings = "";
    if (action.actionKind === "none") settings = `<p class="inline-help">按钮不绑定 DialogAction，仅执行 Dialog 类型和动作后行为规定的默认流程。</p>`;
    if (action.actionKind === "command_template") settings = `${area("命令模板", "commandTemplate", action.commandTemplate, 4, "say $(input_key)")}<p class="inline-help">输入变量使用 <code>$(input_key)</code>。生成代码时不得信任未经校验的输入。</p>`;
    if (action.actionKind === "custom_click") settings = `${field("NamespacedKey", "customClickId", action.customClickId, "text", 'placeholder="plugin:dialog_action"')}${area("附加 SNBT", "additions", action.additions, 4, "{}")}`;
    if (action.actionKind === "static_click") settings = `${selectField("ClickEvent 动作", "clickEvent", action.clickEvent, Object.entries(staticClickEventNames))}${field("动作值", "clickValue", action.clickValue)}<p class="inline-help"><code>show_dialog</code> 与 <code>custom</code> 填 NamespacedKey，<code>change_page</code> 填正整数，其余动作填文本。</p>`;
    if (action.actionKind === "callback_binding") settings = `${field("回调 Handler ID", "handlerId", action.handlerId)}<p class="inline-help">导出 Java 回调绑定需求；AI 应按目标 API 生成回调与 ClickCallback.Options，不把 lambda 写入配置。</p>`;
    els.inspector.innerHTML = `${field("按钮名称", "label", action.label)}${field("悬浮提示", "tooltip", action.tooltip)}${field("按钮宽度", "width", action.width, "number", 'min="1" max="1024" step="1"')}${selectField("动作类型", "actionKind", action.actionKind, Object.entries(actionKindNames))}<div class="group-label">动作设置</div>${settings}${area("开发备注", "developmentNote", action.developmentNote, 3, "说明权限、冷却、费用或业务动作") }<button class="danger-button" data-delete-selected>${isExit ? "移除退出按钮" : "删除动作按钮"}</button>`;
  }

  function renderInspector() {
    const object = selectedObject();
    if (!object || state.selected.group === "base") renderBaseInspector();
    else if (state.selected.group === "body") renderBodyInspector(object);
    else if (state.selected.group === "input") renderInputInspector(object);
    else renderActionInspector(object, state.selected.group === "exit");
    bindInspector();
    renderValidationInInspector();
    refreshIcons();
  }

  function setPath(target, path, value) {
    const parts = path.split(".");
    let current = target;
    while (parts.length > 1) {
      const part = parts.shift();
      if (!current[part] || typeof current[part] !== "object") current[part] = {};
      current = current[part];
    }
    current[parts[0]] = value;
  }

  function deleteSelected() {
    const { group, id } = state.selected;
    mutate(() => {
      if (group === "exit") state.typeSettings.exitActionEnabled = false;
      else if (["body", "input", "action"].includes(group)) state[listKey(group)] = state[listKey(group)].filter(item => item.id !== id);
      state.selected = { group: "base", id: null };
    });
  }

  function bindInspector() {
    els.inspector.querySelectorAll("[data-field]").forEach(control => {
      control.addEventListener("focus", () => {
        if (!fieldBefore) fieldBefore = clone(state);
      });
      control.addEventListener("input", () => {
        const target = state.selected.group === "base" ? state : selectedObject();
        if (!target) return;
        let value = control.type === "checkbox" ? control.checked : control.value;
        if (control.type === "number") value = control.value === "" ? "" : Number(control.value);
        setPath(target, control.dataset.field, value);
        renderLists();
        renderPreview();
        renderValidationInInspector();
        scheduleSave();
        refreshIcons();
      });
      control.addEventListener("change", () => {
        if (fieldBefore) pushHistory(fieldBefore);
        fieldBefore = null;
        if (["type", "actionKind", "multiline", "hasInitial", "hasStep", "typeSettings.dialogSource", "typeSettings.exitActionEnabled"].includes(control.dataset.field)) renderAll();
      });
    });
    els.inspector.querySelector("[data-delete-selected]")?.addEventListener("click", deleteSelected);
    els.inspector.querySelector("[data-open-picker]")?.addEventListener("click", () => {
      pickerTarget = state.selected.id;
      els.itemSearch.value = "";
      renderPicker();
      els.picker.showModal();
      refreshIcons();
    });
  }

  function jsonComponentText(node) {
    if (node === null || node === undefined) return "";
    if (["string", "number", "boolean"].includes(typeof node)) return String(node);
    if (Array.isArray(node)) return node.map(jsonComponentText).join("");
    if (typeof node !== "object") return "";

    let own = "";
    if (node.text !== undefined) own = jsonComponentText(node.text);
    else if (node.translate !== undefined) own = jsonComponentText(node.fallback ?? node.translate);
    else if (node.keybind !== undefined) own = jsonComponentText(node.keybind);
    else if (node.selector !== undefined) own = jsonComponentText(node.selector);
    else if (node.nbt !== undefined) own = jsonComponentText(node.nbt);
    else if (node.score && typeof node.score === "object") own = jsonComponentText(node.score.value ?? node.score.name ?? "");

    const argumentsText = Array.isArray(node.with) ? node.with.map(jsonComponentText).join("") : "";
    const extra = Array.isArray(node.extra) ? node.extra.map(jsonComponentText).join("") : "";
    return own + argumentsText + extra;
  }

  function previewText(value) {
    const raw = String(value ?? "");
    if (!raw.trim() || state.textFormat === "plain") return raw;
    if (state.textFormat === "mini_message") return raw.replace(/<[^>]*>/g, "").replace(/[&§][0-9a-fk-or]/gi, "");
    try {
      return jsonComponentText(JSON.parse(raw));
    } catch (_) {
      return "[JSON 解析失败]";
    }
  }

  function materialIconId(material) {
    const value = String(material || "").trim().toLowerCase();
    if (!value.includes(":")) return value;
    return value.startsWith("minecraft:") ? value.slice("minecraft:".length) : "";
  }

  function materialKey(material) {
    const value = String(material || "").trim().toLowerCase();
    return value.includes(":") ? value : `minecraft:${value}`;
  }

  function iconFor(material) {
    const wrap = document.createElement("div");
    wrap.className = "mc-item-icon";
    const id = materialIconId(material);
    const img = document.createElement("img");
    const path = window.MC_ICON_MAP?.[id];
    img.alt = id || material;
    const showFallback = () => {
      img.style.display = "none";
      if (!wrap.querySelector(".fallback-letter")) {
        const fallback = document.createElement("span");
        fallback.className = "fallback-letter";
        fallback.textContent = id === "air" ? "∅" : (id || "??").slice(0, 2).toUpperCase();
        wrap.append(fallback);
      }
    };
    img.addEventListener("error", showFallback);
    if (path) img.src = `../gui-editor/${path}`;
    else queueMicrotask(showFallback);
    wrap.append(img);
    return wrap;
  }

  function parseOptions(raw) {
    return String(raw || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => {
      const [id, display, initial] = line.split("|");
      return { id: (id || "").trim(), display: (display || id || "").trim(), initial: String(initial || "").trim().toLowerCase() === "true" };
    });
  }

  function clamp(value, minimum, maximum, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
  }

  function setPreviewWidth(element, value, maximum = 520) {
    element.style.width = `${clamp(value, 1, maximum, maximum)}px`;
    element.style.maxWidth = "100%";
  }

  function previewActionItems() {
    const exit = exitTypes.has(state.type) && state.typeSettings.exitActionEnabled ? [{ ...state.exitAction, isExit: true }] : [];
    if (state.type === "notice") return state.actions.length ? [state.actions[0]] : [{ label: "完成", width: 150, placeholder: true }];
    if (state.type === "confirmation") return [state.actions[0] || { label: "缺少确认按钮", missing: true }, state.actions[1] || { label: "缺少取消按钮", missing: true }];
    if (state.type === "multi_action") return [...state.actions, ...exit];
    if (state.type === "dialog_list") {
      const listWidth = state.typeSettings.buttonWidth;
      const dialogs = state.typeSettings.dialogSource === "tag"
        ? [{ label: `#${String(state.typeSettings.dialogTag || "未设置 Tag").replace(/^#/, "")}（运行时列表）`, width: listWidth, placeholder: true }]
        : String(state.typeSettings.dialogRefs || "").split(/\r?\n/).map(value => value.trim()).filter(Boolean).map(label => ({ label, width: listWidth, placeholder: true }));
      return [...dialogs, ...exit];
    }
    return [{ label: "服务器提供的链接（运行时）", width: state.typeSettings.buttonWidth, placeholder: true }, ...exit];
  }

  function renderPreview() {
    const fragment = document.createDocumentFragment();
    const title = document.createElement("h3");
    title.className = "mc-title";
    title.textContent = previewText(state.title) || "未命名 Dialog";
    fragment.append(title);

    const bodyWrap = document.createElement("div");
    bodyWrap.className = "mc-body";
    state.bodies.forEach(body => {
      if (body.kind === "plain_message") {
        const element = document.createElement("div");
        element.className = "mc-message";
        element.textContent = previewText(body.contents);
        setPreviewWidth(element, body.width);
        bodyWrap.append(element);
        return;
      }
      const element = document.createElement("div");
      element.className = "mc-item-body";
      const icon = iconFor(body.material);
      icon.style.width = `${clamp(body.width, 1, 256, 64)}px`;
      icon.style.height = `${clamp(body.height, 1, 256, 64)}px`;
      if (body.showDecorations && Number(body.amount) > 1) {
        const amount = document.createElement("span");
        amount.className = "mc-amount";
        amount.textContent = String(body.amount);
        icon.append(amount);
      }
      element.append(icon);
      const text = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = previewText(body.itemName) || materialKey(body.material);
      const material = document.createElement("code");
      material.textContent = materialKey(body.material);
      const description = document.createElement("small");
      const lore = String(body.lore || "").split(/\r?\n/).filter(Boolean).slice(0, 2);
      description.textContent = [previewText(body.description), ...lore.map(previewText)].filter(Boolean).join(" · ");
      text.append(name, material, description);
      element.append(text);
      bodyWrap.append(element);
    });
    fragment.append(bodyWrap);

    const inputs = document.createElement("div");
    inputs.className = "mc-inputs";
    state.inputs.forEach(input => {
      const fieldNode = document.createElement("div");
      fieldNode.className = "mc-field";
      if (input.kind !== "boolean") setPreviewWidth(fieldNode, input.width);
      if (input.kind === "boolean") fieldNode.innerHTML = `<label class="mc-check"><input type="checkbox" tabindex="-1" disabled ${input.initial ? "checked" : ""}> ${escapeHtml(previewText(input.label))}</label>`;
      if (input.kind === "text") {
        fieldNode.innerHTML = `${input.labelVisible ? `<label>${escapeHtml(previewText(input.label))}</label>` : ""}${input.multiline ? `<textarea tabindex="-1" disabled rows="${clamp(input.maxLines, 1, 6, 4)}">${escapeHtml(input.initial)}</textarea>` : `<input tabindex="-1" disabled type="text" value="${escapeAttr(input.initial)}">`}`;
        if (input.multiline) {
          const textarea = fieldNode.querySelector("textarea");
          textarea.style.height = `${clamp(input.height, 1, 512, 80)}px`;
          textarea.style.minHeight = "0";
        }
      }
      if (input.kind === "number_range") {
        const displayValue = input.hasInitial ? input.initial : input.start;
        const label = String(input.labelFormat || "%s: %s").replace("%s", previewText(input.label)).replace("%s", displayValue);
        fieldNode.innerHTML = `<label>${escapeHtml(label)}</label><input tabindex="-1" disabled type="range" min="${escapeAttr(input.start)}" max="${escapeAttr(input.end)}" step="${escapeAttr(input.hasStep ? input.step : 1)}" value="${escapeAttr(displayValue)}">`;
      }
      if (input.kind === "single_option") fieldNode.innerHTML = `${input.labelVisible ? `<label>${escapeHtml(previewText(input.label))}</label>` : ""}<select tabindex="-1" disabled>${parseOptions(input.entries).map(option => `<option ${option.initial ? "selected" : ""}>${escapeHtml(previewText(option.display))}</option>`).join("")}</select>`;
      inputs.append(fieldNode);
    });
    fragment.append(inputs);

    const actionItems = previewActionItems();
    const actions = document.createElement("div");
    actions.className = "mc-actions";
    const columns = state.type === "confirmation" ? 2 : ["multi_action", "dialog_list", "server_links"].includes(state.type) ? clamp(state.typeSettings.columns, 1, 6, 1) : 1;
    actions.style.setProperty("--columns", columns);
    actionItems.forEach((action, index) => {
      const button = document.createElement("button");
      button.className = `mc-button${index === 0 ? " primary" : ""}${action.missing ? " missing" : ""}${action.placeholder ? " placeholder" : ""}`;
      button.type = "button";
      button.disabled = true;
      button.tabIndex = -1;
      button.textContent = previewText(action.label) || "未命名按钮";
      button.title = previewText(action.tooltip);
      const width = ["dialog_list", "server_links"].includes(state.type) && !action.isExit ? state.typeSettings.buttonWidth : action.width;
      button.style.setProperty("--button-width", `${clamp(width, 1, 1024, 150)}px`);
      actions.append(button);
    });
    fragment.append(actions);
    els.preview.replaceChildren(fragment);

    const issues = validate();
    const stateNode = els.validationState.parentElement;
    stateNode.classList.toggle("invalid", Boolean(issues.length));
    els.validationState.textContent = issues.length ? `${issues.length} 个问题` : "配置有效";
    els.previewType.textContent = `${typeNames[state.type]} Dialog`;
    els.elementCount.textContent = `${state.bodies.length + state.inputs.length + actionItems.length} 个可见元素`;
  }

  function isNamespacedKey(value) {
    return /^[a-z0-9_.-]+:[a-z0-9_./-]+$/.test(String(value || ""));
  }

  function validNumber(value, minimum, maximum, integer = false) {
    if (value === "" || value === null || value === undefined) return false;
    const number = Number(value);
    return Number.isFinite(number) && number >= minimum && number <= maximum && (!integer || Number.isInteger(number));
  }

  function validateJsonComponent(value, label, issues) {
    const raw = String(value ?? "").trim();
    if (state.textFormat !== "json" || !raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed === null || !["string", "object"].includes(typeof parsed)) issues.push(`${label}必须是 Adventure JSON 组件`);
    } catch (_) {
      issues.push(`${label}不是有效的 Adventure JSON`);
    }
  }

  function validateEnchantments(value, label, issues) {
    parseLines(value).forEach((line, index) => {
      const parts = line.split("|").map(part => part.trim());
      const prefix = `${label}附魔第 ${index + 1} 行`;
      if (parts.length !== 2) {
        issues.push(`${prefix}格式必须为 ID|等级`);
        return;
      }
      if (!isNamespacedKey(materialKey(parts[0]))) issues.push(`${prefix}的附魔标识无效`);
      if (!validNumber(parts[1], 1, Number.MAX_SAFE_INTEGER, true)) issues.push(`${prefix}的等级必须为正整数`);
    });
  }

  function validateAttributes(value, label, issues) {
    parseLines(value).forEach((line, index) => {
      const parts = line.split("|").map(part => part.trim());
      const prefix = `${label}属性第 ${index + 1} 行`;
      if (parts.length < 3 || parts.length > 4) {
        issues.push(`${prefix}格式必须为 ID|数值|运算|可选槽位`);
        return;
      }
      if (!isNamespacedKey(materialKey(parts[0]))) issues.push(`${prefix}的属性标识无效`);
      if (parts[1] === "" || !Number.isFinite(Number(parts[1]))) issues.push(`${prefix}的数值必须是有效数字`);
      if (!attributeOperations.has(parts[2])) issues.push(`${prefix}的运算必须是 add_value、add_multiplied_base 或 add_multiplied_total`);
    });
  }

  function validateAction(action, label, issues) {
    if (!action || typeof action !== "object") {
      issues.push(`${label}缺少配置`);
      return;
    }
    if (!String(action.label || "").trim()) issues.push(`${label}名称不能为空`);
    validateJsonComponent(action.label, `${label}名称`, issues);
    validateJsonComponent(action.tooltip, `${label}悬浮提示`, issues);
    if (!validNumber(action.width, 1, 1024, true)) issues.push(`${label}宽度必须为 1..1024 的整数`);
    if (!Object.hasOwn(actionKindNames, action.actionKind)) issues.push(`${label}动作类型无效`);
    if (action.actionKind === "command_template") {
      const template = String(action.commandTemplate || "");
      if (!template.trim()) issues.push(`${label}命令模板不能为空`);
      const inputKeys = new Set(state.inputs.map(input => String(input.key || "").trim()).filter(Boolean));
      const placeholderPattern = /\$\(([^)]*)\)/g;
      const referencedKeys = new Set([...template.matchAll(placeholderPattern)].map(match => match[1].trim()));
      referencedKeys.forEach(key => {
        if (!key) issues.push(`${label}命令模板引用了空输入 Key`);
        else if (!inputKeys.has(key)) issues.push(`${label}命令模板引用了不存在的输入 Key：${key}`);
      });
      if (/\$\(/.test(template.replace(placeholderPattern, ""))) issues.push(`${label}命令模板包含未闭合的输入变量`);
    }
    if (action.actionKind === "custom_click" && !isNamespacedKey(action.customClickId)) issues.push(`${label}NamespacedKey 无效`);
    if (action.actionKind === "static_click") {
      const event = String(action.clickEvent || "").trim();
      const value = String(action.clickValue || "").trim();
      if (!Object.hasOwn(staticClickEventNames, event)) issues.push(`${label}ClickEvent 动作不属于 Adventure 5.2.0 枚举`);
      if (!value) issues.push(`${label}ClickEvent 值不能为空`);
      else if (event === "change_page" && !validNumber(value, 1, Number.MAX_SAFE_INTEGER, true)) issues.push(`${label}切换书页值必须为正整数`);
      else if (["show_dialog", "custom"].includes(event) && !isNamespacedKey(value)) issues.push(`${label}${event} 值必须是有效的 NamespacedKey`);
    }
    if (action.actionKind === "callback_binding" && !String(action.handlerId || "").trim()) issues.push(`${label}Handler ID 不能为空`);
  }

  function validate() {
    const issues = [];
    const keys = new Set();
    if (state.id && !isNamespacedKey(state.id)) issues.push("Dialog ID 必须是有效的 NamespacedKey 或留空");
    if (!String(state.title || "").trim()) issues.push("标题不能为空");
    validateJsonComponent(state.title, "标题", issues);
    validateJsonComponent(state.externalTitle, "外部标题", issues);
    if (!Object.hasOwn(typeNames, state.type)) issues.push("Dialog 类型无效");
    if (!["close", "none", "wait_for_response"].includes(state.afterAction)) issues.push("动作后行为无效");

    state.bodies.forEach((body, index) => {
      const label = `正文 ${index + 1}`;
      if (body.kind === "plain_message") {
        if (!String(body.contents || "").trim()) issues.push(`${label}内容不能为空`);
        validateJsonComponent(body.contents, `${label}内容`, issues);
        if (!validNumber(body.width, 1, 1024, true)) issues.push(`${label}宽度必须为 1..1024 的整数`);
      } else {
        const itemKey = materialKey(body.material);
        if (!isNamespacedKey(itemKey)) issues.push(`${label}物品标识无效`);
        else if (itemKey.startsWith("minecraft:") && minecraftItemIds.size && !minecraftItemIds.has(itemKey.slice("minecraft:".length))) issues.push(`${label}物品不在内置 Minecraft 26.2 注册表中：${itemKey}`);
        if (!validNumber(body.amount, 1, 99, true)) issues.push(`${label}物品数量必须为 1..99 的整数`);
        if (!validNumber(body.width, 1, 256, true) || !validNumber(body.height, 1, 256, true)) issues.push(`${label}物品区域宽高必须为 1..256 的整数`);
        if (body.description && !validNumber(body.descriptionWidth, 1, 1024, true)) issues.push(`${label}说明宽度必须为 1..1024 的整数`);
        validateJsonComponent(body.itemName, `${label}物品名称`, issues);
        parseLines(body.lore).forEach((line, loreIndex) => validateJsonComponent(line, `${label} Lore 第 ${loreIndex + 1} 行`, issues));
        validateJsonComponent(body.description, `${label}物品说明`, issues);
        validateEnchantments(body.enchantments, `${label}：`, issues);
        validateAttributes(body.attributes, `${label}：`, issues);
      }
    });

    state.inputs.forEach((input, index) => {
      const label = `输入 ${index + 1}`;
      if (!String(input.key || "").trim()) issues.push(`${label} Key 不能为空`);
      else if (keys.has(input.key)) issues.push(`输入 Key 重复：${input.key}`);
      else keys.add(input.key);
      if (!String(input.label || "").trim()) issues.push(`${label}标签不能为空`);
      validateJsonComponent(input.label, `${label}标签`, issues);
      if (["text", "number_range", "single_option"].includes(input.kind) && !validNumber(input.width, 1, 1024, true)) issues.push(`${input.key || label} 宽度必须为 1..1024 的整数`);
      if (input.kind === "text") {
        if (!validNumber(input.maxLength, 1, Number.MAX_SAFE_INTEGER, true)) issues.push(`${input.key || label} 最大长度必须为正整数`);
        if (String(input.initial || "").length > Number(input.maxLength)) issues.push(`${input.key || label} 初始文本超过最大长度`);
        if (input.multiline && !validNumber(input.maxLines, 1, Number.MAX_SAFE_INTEGER, true)) issues.push(`${input.key || label} 最大行数必须为正整数`);
        if (input.multiline && !validNumber(input.height, 1, 512, true)) issues.push(`${input.key || label} 输入框高度必须为 1..512 的整数`);
      }
      if (input.kind === "number_range") {
        const hasValidBounds = input.start !== "" && input.end !== "" && Number.isFinite(Number(input.start)) && Number.isFinite(Number(input.end));
        if (!hasValidBounds || Number(input.start) >= Number(input.end)) issues.push(`${input.key || label} 起始值必须小于结束值`);
        if (input.hasInitial && (!Number.isFinite(Number(input.initial)) || Number(input.initial) < Number(input.start) || Number(input.initial) > Number(input.end))) issues.push(`${input.key || label} 初始值超出范围`);
        if (input.hasStep && (!Number.isFinite(Number(input.step)) || Number(input.step) <= 0)) issues.push(`${input.key || label} 步长必须大于 0`);
      }
      if (input.kind === "single_option") {
        const options = parseOptions(input.entries);
        const ids = options.map(option => option.id);
        if (!options.length) issues.push(`${input.key || label} 至少需要一个选项`);
        if (ids.some(id => !id)) issues.push(`${input.key || label} 存在空选项 ID`);
        if (new Set(ids).size !== ids.length) issues.push(`${input.key || label} 的选项 ID 重复`);
        if (options.filter(option => option.initial).length > 1) issues.push(`${input.key || label} 只能有一个默认选项`);
        options.forEach((option, optionIndex) => validateJsonComponent(option.display, `${input.key || label} 选项 ${optionIndex + 1} 显示文本`, issues));
      }
    });

    if (state.type === "confirmation" && state.actions.length < 2) issues.push("确认型 Dialog 需要两个动作按钮");
    if (state.type === "multi_action" && !state.actions.length) issues.push("多动作型 Dialog 至少需要一个动作按钮");
    visibleActions().forEach((action, index) => validateAction(action, `动作按钮 ${index + 1}：`, issues));
    if (exitTypes.has(state.type) && state.typeSettings.exitActionEnabled) validateAction(state.exitAction, "退出按钮：", issues);
    if (["multi_action", "dialog_list", "server_links"].includes(state.type) && !validNumber(state.typeSettings.columns, 1, Number.MAX_SAFE_INTEGER, true)) issues.push("按钮列数必须为正整数");
    if (["dialog_list", "server_links"].includes(state.type) && !validNumber(state.typeSettings.buttonWidth, 1, 1024, true)) issues.push("列表按钮宽度必须为 1..1024 的整数");
    if (state.type === "dialog_list") {
      if (state.typeSettings.dialogSource === "keys") {
        const refs = String(state.typeSettings.dialogRefs || "").split(/\r?\n/).map(value => value.trim()).filter(Boolean);
        if (!refs.length) issues.push("Dialog 列表至少需要一个注册键");
        refs.filter(ref => !isNamespacedKey(ref)).forEach(ref => issues.push(`Dialog ID 无效：${ref}`));
      } else if (!isNamespacedKey(String(state.typeSettings.dialogTag || "").replace(/^#/, ""))) issues.push("Dialog Tag 必须是有效的 NamespacedKey");
    }
    return issues;
  }

  function renderValidationInInspector() {
    const issues = validate();
    els.inspector.querySelector(".validation-list")?.remove();
    if (!issues.length) return;
    const box = document.createElement("div");
    box.className = "validation-list";
    box.setAttribute("role", "alert");
    box.innerHTML = issues.map(issue => `• ${escapeHtml(issue)}`).join("<br>");
    els.inspector.prepend(box);
  }

  function renderPicker() {
    const query = els.itemSearch.value.trim().toLowerCase().replace(/^minecraft:/, "");
    const all = Array.isArray(window.MC_ITEMS) ? window.MC_ITEMS : [];
    const filtered = all.filter(id => !query || id.includes(query));
    const shown = filtered.slice(0, 360);
    els.itemCount.textContent = filtered.length > shown.length ? `${filtered.length} 项，显示前 ${shown.length} 项` : `${filtered.length} 项`;
    els.pickerGrid.replaceChildren(...shown.map(id => {
      const button = document.createElement("button");
      button.className = "picker-item";
      button.title = `minecraft:${id}`;
      button.setAttribute("aria-label", `选择 minecraft:${id}`);
      const img = document.createElement("img");
      const path = window.MC_ICON_MAP?.[id];
      img.alt = "";
      const showFallback = () => {
        img.style.display = "none";
        if (!button.querySelector(".fallback-letter")) {
          const fallback = document.createElement("span");
          fallback.className = "fallback-letter";
          fallback.textContent = id === "air" ? "∅" : id.slice(0, 2).toUpperCase();
          button.append(fallback);
        }
      };
      img.addEventListener("error", showFallback);
      if (path) img.src = `../gui-editor/${path}`;
      else queueMicrotask(showFallback);
      button.append(img);
      button.addEventListener("click", () => {
        const body = state.bodies.find(entry => entry.id === pickerTarget);
        if (body) mutate(() => { body.material = id; });
        els.picker.close();
      });
      return button;
    }));
  }

  function component(value) {
    return { 格式: state.textFormat, 内容: value };
  }

  function parseLines(value) {
    return String(value || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  }

  function numberOrSource(value) {
    const source = String(value ?? "").trim();
    if (!source) return null;
    const number = Number(source);
    return Number.isFinite(number) ? number : source;
  }

  function parseEnchantments(value) {
    return parseLines(value).map(line => {
      const [id, level] = line.split("|").map(part => part.trim());
      return { 附魔标识: materialKey(id), 等级: numberOrSource(level) };
    });
  }

  function parseAttributes(value) {
    return parseLines(value).map(line => {
      const [id, amount, operation, slot] = line.split("|").map(part => part.trim());
      return { 属性标识: materialKey(id), 数值: numberOrSource(amount), 运算: operation || null, 槽位: slot || null };
    });
  }

  function exportBody(body) {
    if (body.kind === "plain_message") return {
      种类: "plain_message",
      内容: component(body.contents),
      宽度: body.width,
      开发备注: body.developmentNote || null
    };
    return {
      种类: "item",
      物品: {
        物品标识: materialKey(body.material),
        数量: body.amount,
        自定义名称: body.itemName ? component(body.itemName) : null,
        物品描述行: parseLines(body.lore).map(component),
        附魔光效: body.glint,
        不可破坏: body.unbreakable,
        自定义模型数据: body.customModelData || null,
        附魔: parseEnchantments(body.enchantments),
        属性: parseAttributes(body.attributes),
        额外组件或NBT: body.extraNbt || null
      },
      描述: body.description ? { 种类: "plain_message", 内容: component(body.description), 宽度: body.descriptionWidth } : null,
      显示装饰: body.showDecorations,
      显示提示: body.showTooltip,
      宽度: body.width,
      高度: body.height,
      开发备注: body.developmentNote || null
    };
  }

  function exportInput(input) {
    const base = { 种类: input.kind, 输入键: input.key, 标签: component(input.label), 开发备注: input.developmentNote || null };
    if (input.kind === "boolean") return { ...base, 初始值: input.initial, 开启模板值: input.onTrue, 关闭模板值: input.onFalse };
    if (input.kind === "number_range") return { ...base, 起始值: input.start, 结束值: input.end, 宽度: input.width, 标签格式: input.labelFormat, 初始值: input.hasInitial ? input.initial : null, 步长: input.hasStep ? input.step : null };
    if (input.kind === "single_option") return { ...base, 宽度: input.width, 显示标签: input.labelVisible, 选项: parseOptions(input.entries).map(option => ({ 选项标识: option.id, 显示文本: component(option.display), 默认选中: option.initial })) };
    return { ...base, 宽度: input.width, 显示标签: input.labelVisible, 初始文本: input.initial, 最大长度: input.maxLength, 多行选项: input.multiline ? { 最大行数: input.maxLines, 高度: input.height } : null };
  }

  function exportAction(action) {
    let exportedAction = null;
    if (action.actionKind === "command_template") exportedAction = { 类型: "command_template", 命令模板: action.commandTemplate };
    if (action.actionKind === "custom_click") exportedAction = { 类型: "custom_click", 点击标识: action.customClickId, 附加数据SNBT: action.additions || null };
    if (action.actionKind === "static_click") exportedAction = { 类型: "static_click", 点击事件类型: action.clickEvent, 动作值: action.clickValue };
    if (action.actionKind === "callback_binding") exportedAction = { 类型: "callback_binding", 处理器标识: action.handlerId, 实现说明: "由 Java customClick(callback, options) 绑定" };
    return {
      按钮名称: component(action.label),
      悬浮提示: action.tooltip ? component(action.tooltip) : null,
      宽度: action.width,
      动作: exportedAction,
      开发备注: action.developmentNote || null
    };
  }

  function exportType() {
    const exitAction = exitTypes.has(state.type) && state.typeSettings.exitActionEnabled ? exportAction(state.exitAction) : null;
    if (state.type === "notice") return { 种类: "notice", 通知按钮: state.actions[0] ? exportAction(state.actions[0]) : { 使用Paper默认按钮: true } };
    if (state.type === "confirmation") return { 种类: "confirmation", 确认按钮: state.actions[0] ? exportAction(state.actions[0]) : null, 取消按钮: state.actions[1] ? exportAction(state.actions[1]) : null };
    if (state.type === "multi_action") return { 种类: "multi_action", 列数: state.typeSettings.columns, 动作按钮: state.actions.map(exportAction), 退出按钮: exitAction };
    if (state.type === "dialog_list") {
      const dialogs = state.typeSettings.dialogSource === "tag"
        ? { 来源: "dialog_tag", Dialog标签: String(state.typeSettings.dialogTag || "").replace(/^#/, "") }
        : { 来源: "registered_keys", Dialog标识列表: parseLines(state.typeSettings.dialogRefs) };
      return { 种类: "dialog_list", 列数: state.typeSettings.columns, 按钮宽度: state.typeSettings.buttonWidth, Dialog集合: dialogs, 退出按钮: exitAction };
    }
    return { 种类: "server_links", 列数: state.typeSettings.columns, 按钮宽度: state.typeSettings.buttonWidth, 链接来源: "玩家连接携带的 ServerLinks", 退出按钮: exitAction };
  }

  function exportData() {
    const issues = validate();
    return {
      配置版本: 2,
      目标平台: `Paper ${VERSION}`,
      API状态: "Experimental",
      Dialog标识: state.id || null,
      基础: {
        标题: component(state.title),
        外部标题: state.externalTitle ? component(state.externalTitle) : null,
        允许Esc关闭: state.canCloseWithEscape,
        暂停单人游戏: state.pause,
        动作后行为: state.afterAction,
        正文: state.bodies.map(exportBody),
        输入: state.inputs.map(exportInput)
      },
      类型: exportType(),
      校验: { 状态: issues.length ? "存在问题" : "通过", 问题: issues },
      安全要求: [
        "不信任 DialogResponseView 中的客户端输入",
        "按输入 Key、类型和值域在服务端重新校验",
        "回调 Audience 不得直接强制转换为 Player",
        "自定义 Click 事件先匹配 NamespacedKey，再判空响应"
      ]
    };
  }

  function yamlScalar(value) {
    if (value === null) return "null";
    if (typeof value === "boolean") return String(value);
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return `"${String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
  }

  function toYaml(value, indent = 0) {
    const pad = " ".repeat(indent);
    if (Array.isArray(value)) {
      if (!value.length) return `${pad}[]`;
      return value.map(item => item && typeof item === "object" ? `${pad}-\n${toYaml(item, indent + 2)}` : `${pad}- ${yamlScalar(item)}`).join("\n");
    }
    if (value && typeof value === "object") {
      const entries = Object.entries(value);
      if (!entries.length) return `${pad}{}`;
      return entries.map(([key, item]) => item && typeof item === "object" ? `${pad}${key}:\n${toYaml(item, indent + 2)}` : `${pad}${key}: ${yamlScalar(item)}`).join("\n");
    }
    return `${pad}${yamlScalar(value)}`;
  }

  function outputFor(format) {
    const data = exportData();
    const yaml = `# Paper ${VERSION} Dialog UI 需求配置，由可视化编辑器生成\n# 所有中文键均为需求语义；英文枚举值与 NamespacedKey 是实现标识\n# AI 必须按目标 Paper API 转换并验证，不得直接信任客户端响应\n${toYaml(data)}`;
    if (format === "json") return JSON.stringify(data, null, 2);
    if (format === "prompt") return [
      "请使用 $develop-minecraft-server-plugin 根据以下 Dialog UI 设计辅助开发插件。",
      `目标为 Paper ${VERSION} Experimental Dialog API。先检查“校验.问题”，制定计划后再生成 Java 实现与服务端响应验证。`,
      "不要假定 Paper 1.21.6 快照与 26.2 具有相同方法签名；必须查询 Skill 内置的目标版本 API 源码。",
      "配置中的中文键表示需求语义，不要求插件运行时原样读取此结构。",
      "",
      "```yaml",
      yaml,
      "```"
    ].join("\n");
    return yaml;
  }

  function updateExport() {
    const issues = validate();
    els.exportOutput.value = outputFor(exportFormat);
    els.exportNote.textContent = issues.length ? `当前有 ${issues.length} 个校验问题，已写入导出内容；交给 AI 前应逐项解决。` : "配置校验通过。AI 仍需按目标 Paper API 生成并验证实际 Java 代码。";
    els.exportNote.classList.toggle("invalid", Boolean(issues.length));
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    setTimeout(() => els.toast.classList.remove("show"), 1600);
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons({ attrs: { "aria-hidden": "true" } });
  }

  function renderAll() {
    renderLists();
    renderInspector();
    renderPreview();
    updateHistory();
    refreshIcons();
  }

  function addActionForType() {
    mutate(() => {
      if (["dialog_list", "server_links"].includes(state.type)) {
        if (state.typeSettings.exitActionEnabled) {
          showToast("此类型只有一个可选退出按钮");
          return;
        }
        state.typeSettings.exitActionEnabled = true;
        state.selected = { group: "exit", id: state.exitAction.id };
        return;
      }
      const limit = state.type === "notice" ? 1 : state.type === "confirmation" ? 2 : Number.POSITIVE_INFINITY;
      if (state.actions.length >= limit) {
        showToast(state.type === "notice" ? "通知型最多使用一个动作按钮" : "确认型只使用两个动作按钮");
        return;
      }
      const action = newAction(state.type === "confirmation" && state.actions.length === 1 ? "取消" : `动作 ${state.actions.length + 1}`);
      state.actions.push(action);
      state.selected = { group: "action", id: action.id };
    });
  }

  function bindStaticEvents() {
    document.querySelector(".base-entry").addEventListener("click", () => selectEntry("base", null));
    document.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => mutate(() => {
      const body = newBody(button.dataset.add);
      state.bodies.push(body);
      state.selected = { group: "body", id: body.id };
    })));
    $("#addInputBtn").addEventListener("click", () => mutate(() => {
      const input = newInput($("#inputKind").value);
      state.inputs.push(input);
      state.selected = { group: "input", id: input.id };
    }));
    els.addAction.addEventListener("click", addActionForType);
    els.undo.addEventListener("click", () => restore(undoStack, redoStack));
    els.redo.addEventListener("click", () => restore(redoStack, undoStack));
    $("#resetBtn").addEventListener("click", () => {
      if (confirm("恢复 Dialog 编辑器的默认示例？")) mutate(() => { state = defaultState(); });
    });
    els.itemSearch.addEventListener("input", renderPicker);
    $("#closePickerBtn").addEventListener("click", () => els.picker.close());
    $("#exportBtn").addEventListener("click", () => {
      updateExport();
      els.exportDialog.showModal();
      if (validate().length) showToast("导出内容中已标记校验问题");
      refreshIcons();
    });
    $("#closeExportBtn").addEventListener("click", () => els.exportDialog.close());
    $("#exportFormat").addEventListener("click", event => {
      const button = event.target.closest("[data-format]");
      if (!button) return;
      exportFormat = button.dataset.format;
      document.querySelectorAll("[data-format]").forEach(candidate => {
        const active = candidate === button;
        candidate.classList.toggle("active", active);
        candidate.setAttribute("aria-pressed", String(active));
      });
      updateExport();
    });
    els.copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(els.exportOutput.value);
      } catch (_) {
        els.exportOutput.select();
        document.execCommand("copy");
      }
      showToast("已复制导出内容");
    });
    els.download.addEventListener("click", () => {
      const extension = exportFormat === "yaml" ? "yml" : exportFormat === "json" ? "json" : "md";
      const url = URL.createObjectURL(new Blob([els.exportOutput.value], { type: "text/plain;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `minecraft-dialog-config.${extension}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });
  }

  window.MC_DIALOG_EDITOR_EXPORT = format => outputFor(["yaml", "json", "prompt"].includes(format) ? format : "json");
  window.MC_DIALOG_EDITOR_VALIDATE = () => clone(validate());

  bindStaticEvents();
  renderAll();
})();
