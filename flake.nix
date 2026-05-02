{
  description = "JTC-flavored GitHub frontend workspace";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    treefmt-nix.url = "github:numtide/treefmt-nix";
  };

  outputs =
    inputs@{ flake-parts, treefmt-nix, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      imports = [ treefmt-nix.flakeModule ];
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      perSystem =
        {
          config,
          pkgs,
          ...
        }:
        let
          linuxDesktopPackages = with pkgs; [
            gtk3
            webkitgtk_4_1
            libsoup_3
            glib
            glib-networking
            gdk-pixbuf
            pango
            cairo
            atk
            at-spi2-atk
            at-spi2-core
            librsvg
            libayatana-appindicator
            zlib
            stdenv.cc.cc.lib
          ];
        in
        {
          devShells.default = pkgs.mkShell {
            inputsFrom = [ config.treefmt.build.devShell ];

            packages = [
              pkgs.bun
              pkgs.nodejs_24
              pkgs.pkg-config
            ]
            ++ pkgs.lib.optionals pkgs.stdenv.isLinux linuxDesktopPackages;

            LD_LIBRARY_PATH = pkgs.lib.optionalString pkgs.stdenv.isLinux (
              pkgs.lib.makeLibraryPath [
                pkgs.webkitgtk_4_1
                pkgs.libsoup_3
                pkgs.glib-networking
                pkgs.stdenv.cc.cc.lib
              ]
            );

            GIO_MODULE_PATH = pkgs.lib.optionalString pkgs.stdenv.isLinux "${pkgs.glib-networking}/lib/gio/modules";

            shellHook = ''
              export PATH="$PWD/bin:$PWD/node_modules/.bin:$PATH"
            '';
          };

          treefmt = {
            projectRootFile = "flake.nix";

            programs.nixfmt.enable = true;
          };
        };
    };
}
