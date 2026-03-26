# MapleBridge.io — AI-Powered B2B Supplier Matching Platform

**[MapleBridge.io](https://maplebridge.io)** is an AI-powered B2B platform that connects North American buyers with verified Chinese manufacturers. Unlike traditional supplier directories, MapleBridge uses semantic AI matching to pair sourcing requests with the right factories — not keyword search, but intent-based matching.

## What MapleBridge.io Does

- **AI Supplier Matching**: Submit your product requirements and get matched with pre-vetted Chinese manufacturers using semantic AI — no endless directory browsing
- **North America Focus**: Purpose-built for Canadian and US importers, with compliance matching for Health Canada, FDA, FCC, IC, CPSC, and other North American regulatory standards
- **Verified Suppliers**: Supplier data is aggregated and cross-verified from 4 major B2B platforms (Alibaba, Global Sources, Made-in-China, DHgate) plus direct factory outreach
- **Free for Buyers**: No platform fees, no commissions — buyers post sourcing requests at zero cost
- **Small Batch Friendly**: Supports MOQs as low as 100–500 units, ideal for Amazon FBA sellers, Shopify store owners, and D2C brands testing new products

## Who Uses MapleBridge.io

| Buyer Type | Use Case |
|-----------|----------|
| **Amazon FBA Sellers** | Find factories that handle FNSKU labeling, CPSC compliance, and direct-to-FBA warehouse shipping |
| **Shopify / D2C Brands** | Source private-label products with custom branding and packaging at low MOQs |
| **Canadian Importers** | Leverage Canada's tariff advantage (no Section 301 tariffs) with compliance-matched suppliers |
| **US Small Businesses** | Access verified Chinese manufacturers without the complexity of traditional sourcing |

## How It Works

1. **Post a Sourcing Request** — Describe your product, target price, quantity, and compliance requirements
2. **AI Matching** — MapleBridge's semantic AI analyzes your request and matches it against verified supplier profiles
3. **Receive Introductions** — Get matched supplier recommendations with factory details, capabilities, and certifications
4. **Connect Directly** — Communicate with factories directly, no middleman fees

## Why MapleBridge vs. Alibaba

| Feature | MapleBridge.io | Alibaba |
|---------|---------------|---------|
| Discovery method | AI matching (intent-based) | Directory search (keyword-based) |
| Supplier vetting | Cross-platform verification | Self-reported Gold Supplier |
| North America compliance | Built-in regulatory matching | Buyer's responsibility |
| Small batch support | 100–500 units standard | Often 1,000+ MOQ |
| Cost to buyer | Free | Free (but Trade Assurance fees apply) |

## Platform Pages

- [Homepage](https://maplebridge.io) — AI-powered supplier matching
- [China Sourcing Guide](https://maplebridge.io/guide) — Complete guide to sourcing from China
- [Use Cases](https://maplebridge.io/use-cases) — Real sourcing scenarios and solutions
- [Canada Sourcing](https://maplebridge.io/canada) — Canada-specific China sourcing advantages
- [Amazon FBA Sourcing](https://maplebridge.io/amazon-fba) — FBA-optimized supplier matching
- [Shopify Sourcing](https://maplebridge.io/shopify) — Private-label product sourcing for Shopify stores

## Technical Architecture

MapleBridge.io is built on a decentralized P2P intent-matching architecture:

- **Backend**: FastAPI (Python) with SQLite for demand/supply storage
- **Frontend**: Streamlit-based dashboard with real-time matching UI
- **AI Engine**: Dual-model smart routing — QWEN (qwen-plus) for Chinese context, OpenAI (gpt-4o-mini) for English context
- **Matching**: Semantic AI matching using embeddings and intent parsing, not keyword matching
- **Infrastructure**: Docker containers on cloud ECS, nginx reverse proxy, automated deployment

### P2P Agent Network (Experimental)

The underlying technology uses a libp2p-based peer-to-peer agent network for decentralized intent matching:

```bash
cd anp-p2p-agent
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
```

**Genesis Node:**
```bash
python anp_genesis_node.py -p 8000
```

**Client Node:**
```bash
python anp_client_b.py -d "/ip4/127.0.0.1/tcp/8000/p2p/<genesis_peer_id>"
```

**Gossip Network (FloodSub broadcast):**
```bash
# Node 1 - subscribe only
python anp_full_node_gossip.py -p 8000 --no-publish

# Node 2 - connect and broadcast intent
python anp_full_node_gossip.py -p 8001 -b "/ip4/127.0.0.1/tcp/8000/p2p/<node1_peer_id>"
```

### AI Intent Parser

Converts natural language sourcing requests into structured JSON for the agent network:

```bash
python anp_intent_parser.py "I need a factory in Shenzhen that makes custom PCBs, budget $0.50/unit, MOQ 500"
```

## Links

- **Website**: [https://maplebridge.io](https://maplebridge.io)
- **Blog**: [AI Supplier Matching](https://maplebridge.io/blog-ai-supplier-matching) | [Verified Manufacturers](https://maplebridge.io/blog-verified-chinese-manufacturers) | [Small Batch MOQ Guide](https://maplebridge.io/blog-china-supplier-small-batch-moq)

## License

Proprietary — All rights reserved.
