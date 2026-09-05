"""Startup banner — TEJU AI"""

from __future__ import annotations

_WORDMARK = (
"████████╗███████╗     ██╗██╗   ██╗",
"╚══██╔══╝██╔════╝     ██║██║   ██║",
"   ██║   █████╗       ██║██║   ██║",
"   ██║   ██╔══╝  ██   ██║██║   ██║",
"   ██║   ███████╗╚█████╔╝╚██████╔╝",
"   ╚═╝   ╚══════╝ ╚════╝  ╚═════╝ ",
)

_TAGLINE = "Your Personal AI Operating System"


def print_banner(quiet: bool = False) -> None:
    if quiet:
        return

    try:
        from rich.console import Console

        console = Console()

        console.print()

        for line in _WORDMARK:
            console.print(
                line,
                style="bold bright_cyan",
                highlight=False,
                markup=False,
            )

        console.print(
            "\n        TEJU AI OS",
            style="bold bright_white",
            highlight=False,
        )

        console.print(
            "      Your Personal AI Operating System",
            style="bright_green",
            highlight=False,
        )

        console.print()

    except ImportError:
        for line in _WORDMARK:
            print(line)

        print("\nTEJU AI OS")
        print("Your Personal AI Operating System\n")