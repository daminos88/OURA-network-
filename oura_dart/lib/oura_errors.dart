class OuraError implements Exception {
  final String message;
  const OuraError(this.message);

  @override
  String toString() => '4runtimeType: 4message';
}

class InvalidPolicyError extends OuraError {
  const InvalidPolicyError(super.message);
}

class UnsupportedVersionError extends OuraError {
  const UnsupportedVersionError(super.message);
}

class EvaluationFailureError extends OuraError {
  const EvaluationFailureError(super.message);
}

class InvalidBundleError extends OuraError {
  const InvalidBundleError(super.message);
}

class InvalidSignatureError extends OuraError {
  const InvalidSignatureError([super.message = 'Invalid signature']);
}

class UnknownKeyIdError extends OuraError {
  const UnknownKeyIdError(super.message);
}

class ExpiredBundleError extends OuraError {
  const ExpiredBundleError([super.message = 'Bundle expired']);
}

class BundleNotLoadedError extends OuraError {
  const BundleNotLoadedError([super.message = 'Bundle not loaded']);
}

class CacheFailureError extends OuraError {
  const CacheFailureError(super.message);
}
