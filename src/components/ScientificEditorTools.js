// Scientific notation is saved as ordinary editable HTML and Unicode so it can
// be displayed anywhere the existing question HTML is displayed.
const symbolGroups = [
  { name: "Toán học", symbols: ["±", "×", "÷", "≠", "≈", "≤", "≥", "∞", "√", "∑", "∏", "∫", "∂", "∆", "∈", "∉", "∩", "∪", "∅", "∠", "°", "π"] },
  { name: "Chữ cái Hy Lạp", symbols: ["α", "β", "γ", "δ", "ε", "θ", "λ", "μ", "ν", "ξ", "ρ", "σ", "τ", "φ", "ω", "Δ", "Ω"] },
  { name: "Vật lí và hóa học", symbols: ["→", "←", "↔", "⇌", "↑", "↓", "°", "℃", "℉", "Ω", "µ", "·", "⊕", "⊖", "∝", "ℏ"] },
];

export function setupScientificTools(editor) {
  editor.ui.registry.addMenuButton("sciencesymbols", {
    text: "Ký hiệu",
    tooltip: "Chèn ký hiệu toán, vật lí, hóa học",
    fetch: (callback) => callback(symbolGroups.map((group) => ({
      type: "nestedmenuitem",
      text: group.name,
      getSubmenuItems: () => group.symbols.map((symbol) => ({
        type: "menuitem", text: symbol, onAction: () => editor.insertContent(symbol),
      })),
    }))),
  });

  editor.ui.registry.addButton("sciencefraction", {
    text: "a⁄b",
    tooltip: "Chèn phân số",
    onAction: () => editor.windowManager.open({
      title: "Chèn phân số",
      body: { type: "panel", items: [
        { type: "input", name: "numerator", label: "Tử số" },
        { type: "input", name: "denominator", label: "Mẫu số" },
      ] },
      buttons: [
        { type: "cancel", text: "Hủy" },
        { type: "submit", text: "Chèn", primary: true },
      ],
      onSubmit: (dialog) => {
        const { numerator, denominator } = dialog.getData();
        if (!numerator.trim() || !denominator.trim()) return;
        const top = editor.dom.encode(numerator.trim());
        const bottom = editor.dom.encode(denominator.trim());
        editor.insertContent(`<span style="display:inline-flex;vertical-align:middle;flex-direction:column;text-align:center;line-height:1.2;margin:0 0.15em"><span style="border-bottom:1px solid;padding:0 0.2em">${top}</span><span style="padding:0 0.2em">${bottom}</span></span>&nbsp;`);
        dialog.close();
      },
    }),
  });
}
