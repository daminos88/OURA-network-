enum VerificationMode {
  strict,
  allowStale,
  signatureOnly,
}

class OuraScores {
  final double R;
  final double B;

  const OuraScores({
    required this.R,
    required this.B,
  });
}

class OuraMeta {
  final String ouraVersion;
  final int? selectedPriority;

  const OuraMeta({
    required this.ouraVersion,
    required this.selectedPriority,
  });
}

class OuraEvaluationResult {
  final bool matched;
  final List<String> matchedRules;
  final OuraScores? scores;
  final OuraMeta meta;

  const OuraEvaluationResult({
    required this.matched,
    required this.matchedRules,
    required this.scores,
    required this.meta,
  });
}

class OuraVerificationResult {
  final bool valid;
  final String status;
  final String? bundleId;
  final String? policyVersion;
  final String? keyId;
  final int? expiresAt;
  final bool stale;

  const OuraVerificationResult({
    required this.valid,
    required this.status,
    required this.bundleId,
    required this.policyVersion,
    required this.keyId,
    required this.expiresAt,
    required this.stale,
  });
}

class OuraTrustKey {
  final String keyId;
  final String alg;
  final String publicKey;

  const OuraTrustKey({
    required this.keyId,
    required this.alg,
    required this.publicKey,
  });

  factory OuraTrustKey.fromJson(Map<String, dynamic> json) {
    return OuraTrustKey(
      keyId: json['key_id'] as String,
      alg: json['alg'] as String,
      publicKey: json['public_key'] as String,
    );
  }
}

class OuraTrustStore {
  final List<OuraTrustKey> trustedKeys;

  const OuraTrustStore({
    required this.trustedKeys,
  });

  factory OuraTrustStore.fromJson(Map<String, dynamic> json) {
    final keys = (json['trusted_keys'] as List<dynamic>)
        .cast<Map<String, dynamic>>()
        .map(OuraTrustKey.fromJson)
        .toList();

    return OuraTrustStore(trustedKeys: keys);
  }
}
