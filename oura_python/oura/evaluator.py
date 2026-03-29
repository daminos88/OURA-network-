def evaluate(policy: dict, context: dict):
    rules = policy.get("rules", [])

    matches = []
    for rule in rules:
        # Placeholder always false
        pass

    return {
        "matched": False,
        "matched_rules": [],
        "scores": None
    }
