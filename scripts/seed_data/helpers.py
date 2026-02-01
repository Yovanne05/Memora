"""Helpers pour créer du contenu JSON Tiptap."""

import json


def _text(content: str, bold: bool = False, italic: bool = False, code: bool = False) -> dict:
    """Crée un noeud texte Tiptap avec marks optionnels."""
    node = {"type": "text", "text": content}
    marks = []
    if bold:
        marks.append({"type": "bold"})
    if italic:
        marks.append({"type": "italic"})
    if code:
        marks.append({"type": "code"})
    if marks:
        node["marks"] = marks
    return node


def _paragraph(*children) -> dict:
    """Crée un paragraphe Tiptap."""
    if not children:
        return {"type": "paragraph"}
    return {"type": "paragraph", "content": list(children)}


def _heading(level: int, text: str) -> dict:
    """Crée un heading Tiptap (h1, h2, h3)."""
    return {
        "type": "heading",
        "attrs": {"level": level},
        "content": [_text(text)]
    }


def _bullet_list(*items) -> dict:
    """Crée une liste à puces Tiptap."""
    list_items = []
    for item in items:
        if isinstance(item, (list, tuple)):
            list_items.append({"type": "listItem", "content": [_paragraph(*item)]})
        else:
            list_items.append({"type": "listItem", "content": [_paragraph(_text(item))]})
    return {"type": "bulletList", "content": list_items}


def _ordered_list(*items) -> dict:
    """Crée une liste numérotée Tiptap."""
    list_items = []
    for item in items:
        if isinstance(item, (list, tuple)):
            list_items.append({"type": "listItem", "content": [_paragraph(*item)]})
        else:
            list_items.append({"type": "listItem", "content": [_paragraph(_text(item))]})
    return {"type": "orderedList", "attrs": {"start": 1}, "content": list_items}


def _code_block(code: str, language: str = "python") -> dict:
    """Crée un bloc de code Tiptap."""
    return {
        "type": "codeBlock",
        "attrs": {"language": language},
        "content": [_text(code)]
    }


def _doc(*children) -> str:
    """Crée un document Tiptap complet et le sérialise en JSON."""
    return json.dumps({"type": "doc", "content": list(children)}, ensure_ascii=False)
