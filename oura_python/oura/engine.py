from .verifier import verify
from .evaluator import evaluate


class OuraEngine:
    def __init__(self, trust_store=None):
        self.trust_store = trust_store
        self.bundle = None

    def load_bundle(self, bundle: dict):
        self.bundle = bundle

    def verify(self):
        return verify(self.bundle)

    def evaluate(self, context: dict):
        policy = self.bundle.get("policy", {})
        return evaluate(policy, context)
