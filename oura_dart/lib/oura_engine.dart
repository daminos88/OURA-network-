import 'dart:convert';

import 'oura_bundle_verifier.dart';
import 'oura_cache.dart';
import 'oura_errors.dart';
import 'oura_evaluator.dart';
import 'oura_types.dart';

class OuraEngine {
  final OuraTrustStore trustStore;
  final OuraCache? cache;

  String? _loadedBundleJson;
  Map<String, dynamic>? _loadedBundle;
  OuraEvaluator? _evaluator;

  OuraEngine({
    required this.trustStore,
    this.cache,
  });

  void loadBundle(String bundleJson) {
    final parsed = jsonDecode(bundleJson);
    if (parsed is! Map<String, dynamic>) {
      throw const InvalidBundleError('Bundle must be a JSON object');
    }
    _loadedBundleJson = bundleJson;
    _loadedBundle = parsed;
    _evaluator = null;
  }

  OuraVerificationResult verifyLoadedBundle({
    VerificationMode mode = VerificationMode.strict,
    int? now,
  }) {
    final bundle = _loadedBundle;
    if (bundle == null) {
      throw const BundleNotLoadedError();
    }

    final result = OuraBundleVerifier.verify(
      bundle: bundle,
      trustStore: trustStore,
      now: now,
      mode: mode,
    );

    final policy = bundle['policy'];
    if (policy is! Map<String, dynamic>) {
      throw const InvalidBundleError('Missing policy');
    }

    _evaluator = OuraEvaluator(policy);
    return result;
  }

  OuraEvaluationResult evaluate(Map<String, dynamic> context) {
    final evaluator = _evaluator;
    if (evaluator == null) {
      throw const EvaluationFailureError('Bundle not verified');
    }
    return evaluator.evaluate(context);
  }

  void cacheLoadedBundle() {
    final json = _loadedBundleJson;
    if (json == null) throw const BundleNotLoadedError();
    final c = cache;
    if (c == null) throw const CacheFailureError('No cache configured');
    c.save(json);
  }

  void loadCachedBundle() {
    final c = cache;
    if (c == null) throw const CacheFailureError('No cache configured');
    loadBundle(c.load());
  }

  String? bundleId() => _loadedBundle?['bundle_id'] as String?;

  int? expiresAt() => _loadedBundle?['expires_at'] as int?;

  String? policyVersion() {
    final policy = _loadedBundle?['policy'];
    if (policy is! Map<String, dynamic>) return null;
    return policy['oura_version'] as String?;
  }
}
