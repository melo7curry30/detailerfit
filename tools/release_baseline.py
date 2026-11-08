"""Verified GitHub main checkpoint for the DET-54/DET-57 release.

Pinned to the independently read remote tree (288 blobs), never candidate HEAD.
Historical redesign snapshots remain available in docs/ for historical audits.
"""
BASE = '6ec4c63a49f2763036eff223ecc2b061f6decb0b'
HCP_DISCLOSURE_BEFORE = 'Both primary buttons are affiliate links. DetailerFit may earn a commission from a qualifying signup, at no extra cost to you.'
HCP_DISCLOSURE_AFTER = 'The QuoteIQ button is an affiliate link. DetailerFit may earn a commission from a qualifying QuoteIQ signup, at no extra cost to you. The Housecall Pro button links to its official site and is not an affiliate link.'
RECONCILED_CHECKS = {
    'tools/check-home.py', 'tools/check-release.py', 'tools/check-sitewide.py',
}
