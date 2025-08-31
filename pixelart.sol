// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract PixelArtNFT is ERC721 {
    // URL base para el token
    string private _baseTokenURI;

    // Conteo del token, que también servirá como ID del token
    uint256 public nextTokenId;

    constructor() ERC721("Pixel Art NFT", "PIXEL") {
        _baseTokenURI = "data:application/json;base64,";
        nextTokenId = 1;
    }

    // Función para reclamar y acuñar un nuevo NFT
    function claimNFT() public returns (uint256) {
        // Obtenemos el ID del token
        uint256 tokenId = nextTokenId;
        // Acuñamos el NFT al emisor de la transacción
        _safeMint(msg.sender, tokenId);
        // Incrementamos el ID del siguiente token
        nextTokenId++;

        return tokenId;
    }

    // Genera el SVG del pixel art con el blockhash como semilla
    function generateSVG(uint256 tokenId) internal view returns (string memory) {
        // Usamos el hash del bloque actual para la aleatoriedad.
        bytes32 blockHash = blockhash(block.number - 1); // Usamos el bloque anterior para evitar manipulaciones
        uint256 seed = uint256(blockHash);

        // Definimos un lienzo de 16x16
        uint256 canvasWidth = 16;
        uint256 canvasHeight = 16;
        uint256 pixelSize = 10; // Tamaño de cada pixel en el SVG

        string memory svgBody = "";

        for (uint256 y = 0; y < canvasHeight; y++) {
            for (uint256 x = 0; x < canvasWidth; x++) {
                // Genera un color aleatorio con el seed
                uint256 colorSeed = uint256(keccak256(abi.encodePacked(seed, x, y)));
                string memory color = generateColor(colorSeed);
                
                // Crea el rectángulo SVG para el pixel
                svgBody = string.concat(
                    svgBody,
                    "<rect x='",
                    uint256ToString(x * pixelSize),
                    "' y='",
                    uint256ToString(y * pixelSize),
                    "' width='",
                    uint256ToString(pixelSize),
                    "' height='",
                    uint256ToString(pixelSize),
                    "' fill='#",
                    color,
                    "'/>"
                );
            }
        }

        // Construye el SVG completo
        string memory svg = string.concat(
            "<svg width='",
            uint256ToString(canvasWidth * pixelSize),
            "' height='",
            uint256ToString(canvasHeight * pixelSize),
            "' xmlns='http://www.w3.org/2000/svg'>",
            svgBody,
            "</svg>"
        );

        return svg;
    }

    // Convierte un número en una cadena de caracteres
    function uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Genera un color hexadecimal aleatorio a partir de un seed
    function generateColor(uint256 seed) internal pure returns (string memory) {
        bytes memory hexChars = "0123456789abcdef";
        bytes memory color = new bytes(6);
        for (uint256 i = 0; i < 6; i++) {
            color[i] = hexChars[(seed >> (i * 4)) & 0xf];
        }
        return string(color);
    }

    // Devuelve el URI del token, que incluye el arte SVG codificado en Base64
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        string memory svg = generateSVG(tokenId);
        string memory json = string.concat(
            "{",
                "'name': 'Pixel Art NFT #", uint256ToString(tokenId), "',",
                "'description': 'Pixel art on-chain generated from block hash.',",
                "'image': '", _baseTokenURI, Base64.encode(bytes(svg)), "'"
            "}"
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }
}