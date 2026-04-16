#!/bin/bash
# Matt's AI OS — Flint local launcher
# Usage: ./open.sh   OR   alias flint='~/hanamoto_ai/sites/flint/open.sh'
#
# Opens directly as a file:// URL — no server needed.
# Clipboard fallback is built into the HTML for file:// compatibility.

open "file://$HOME/hanamoto_ai/sites/flint/index.html"
