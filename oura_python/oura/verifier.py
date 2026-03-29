import json

from .errors import InvalidBundleError


def verify(bundle: dict):
    if "bundle_version" not in bundle:
        raise InvalidBundleError("Missing bundle_version")

    if bundle["bundle_version"] != "1.0.0":
        raise InvalidBundleError("Unsupported version")

    # Placeholder verification
    return {
        "valid": True,
        "status": "VALID"
    }
